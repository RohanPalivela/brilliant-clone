// Firestore persistence for the Pattern Review Engine.
//
// Lives under the same per-user subtree as the rest of progress
// (`users/{uid}/reviewItems/{itemKey}`), so the existing security rule that
// scopes `users/{uid}/**` to its owner already covers it.

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Grade, ReviewItem, ReviewOutcome } from '../types/review';
import {
  gradeOutcome,
  initialSchedule,
  newItemSchedule,
  scheduleNext,
} from '../lib/srs';
import { REVIEWABLE_ITEMS, reviewItemKey } from '../content/skills';
import { REVIEW_BANK_LESSON_ID } from '../content/reviewBank';

const reviewItemsCol = (uid: string) =>
  collection(db, 'users', uid, 'reviewItems');
const reviewItemRef = (uid: string, itemKey: string) =>
  doc(db, 'users', uid, 'reviewItems', itemKey);

export interface EnrollInput {
  courseId: string;
  lessonId: string;
  slideId: string;
  skillId: string;
}

/**
 * Add a freshly-learned problem to the review pool. Called the first time a
 * learner answers an activity slide correctly inside a lesson. If the item is
 * already enrolled we leave its schedule untouched — re-solving a slide while
 * replaying a lesson must not reset the spacing the learner has built up.
 */
export async function enrollReviewItem(
  uid: string,
  input: EnrollInput,
): Promise<void> {
  const itemKey = reviewItemKey(input.lessonId, input.slideId);
  const ref = reviewItemRef(uid, itemKey);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const now = Date.now();
  const item: ReviewItem = {
    itemKey,
    courseId: input.courseId,
    lessonId: input.lessonId,
    slideId: input.slideId,
    skillId: input.skillId,
    ...initialSchedule(now),
    lastResult: 'good',
    attempts: 1,
    correctCount: 1,
    createdAt: now,
  };
  await setDoc(ref, item);
}

/**
 * Bank problems grouped by skill, computed once from the content index. Each
 * skill's list is sorted ASCENDING by authored difficulty so the seeder can
 * introduce easy variants first; ties keep their original `REVIEWABLE_ITEMS`
 * order via a stable sort (Array#sort is stable in V8/modern engines).
 */
const BANK_BY_SKILL = (() => {
  const map = new Map<string, typeof REVIEWABLE_ITEMS>();
  for (const ref of REVIEWABLE_ITEMS) {
    if (ref.lessonId !== REVIEW_BANK_LESSON_ID) continue;
    const arr = map.get(ref.skillId);
    if (arr) arr.push(ref);
    else map.set(ref.skillId, [ref]);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => a.difficulty - b.difficulty);
  }
  return map;
})();

/**
 * Seed a skill's whole practice bank the first time the learner demonstrates
 * that skill in a lesson (mastery learning: don't drill what you haven't met).
 *
 * Two seeding rules keep the queue humane:
 *
 * 1. ASCENDING DIFFICULTY — `BANK_BY_SKILL` is pre-sorted easy→hard, and the
 *    due offset grows with index, so the gentlest variant of a pattern arrives
 *    first and the nastiest greedy traps trickle in last. Learners meet a skill
 *    on a rung they can clear rather than face its hardest problem on day two.
 *
 * 2. NO DAY-0 FLOOD — offsets start at 1 (`offsetDays = i + 1`), so the first
 *    seeded variant is due TOMORROW, not immediately. Demonstrating several
 *    skills in one session used to stack each skill's first item as
 *    instantly-due, spiking a single day to ~17 reviews; now day 0 holds only
 *    the lesson's own freshly-learned item (also due tomorrow) and the bank
 *    variants fan out one per day from there.
 *
 * Seeded items are "new" (reps 0, zero strength) so they don't inflate mastery.
 * Idempotent via a sentinel doc (the first item in sorted order).
 */
export async function enrollSkillBank(
  uid: string,
  skillId: string,
): Promise<void> {
  const items = BANK_BY_SKILL.get(skillId);
  if (!items || items.length === 0) return;

  const sentinel = await getDoc(reviewItemRef(uid, items[0].itemKey));
  if (sentinel.exists()) return;

  const now = Date.now();
  const batch = writeBatch(db);
  items.forEach((ref, i) => {
    const item: ReviewItem = {
      itemKey: ref.itemKey,
      courseId: ref.courseId,
      lessonId: ref.lessonId,
      slideId: ref.slideId,
      skillId: ref.skillId,
      // offsetDays = i + 1: easiest variant due tomorrow, the rest fan out one
      // per day after it — no variant is due on day 0 (see rule 2 above).
      ...newItemSchedule(now, i + 1),
      lastResult: null,
      attempts: 0,
      correctCount: 0,
      createdAt: now,
    };
    batch.set(reviewItemRef(uid, ref.itemKey), item);
  });
  await batch.commit();
}

/** Live stream of every review item the learner has enrolled. */
export function subscribeReviewItems(
  uid: string,
  cb: (items: ReviewItem[]) => void,
): () => void {
  return onSnapshot(reviewItemsCol(uid), (snaps) => {
    cb(snaps.docs.map((d) => d.data() as ReviewItem));
  });
}

/**
 * Record the result of a single review attempt: auto-grade it, advance the
 * scheduler, and bump lifetime stats.
 *
 * Returns `{ grade, item }` where `item` is the FULL post-attempt `ReviewItem`
 * (the same merged object written to Firestore). The UI needs this so that an
 * `again` item requeued for a second in-session attempt is scheduled from its
 * POST-lapse baseline (reps reset, interval short) rather than its stale
 * pre-failure state — otherwise a forgotten-but-well-learned item would be
 * pushed weeks out instead of resurfacing tomorrow.
 */
export async function applyReviewResult(
  uid: string,
  item: ReviewItem,
  outcome: ReviewOutcome,
  now: number = Date.now(),
): Promise<{ grade: Grade; item: ReviewItem }> {
  const grade = gradeOutcome(outcome);
  const next = scheduleNext(item, grade, now);
  const updated: ReviewItem = {
    ...item,
    ...next,
    lastResult: grade,
    attempts: item.attempts + 1,
    correctCount: item.correctCount + (outcome.correct ? 1 : 0),
  };
  await updateDoc(reviewItemRef(uid, item.itemKey), {
    ...next,
    lastResult: updated.lastResult,
    attempts: updated.attempts,
    correctCount: updated.correctCount,
  });
  return { grade, item: updated };
}
