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

/** Bank problems grouped by skill, computed once from the content index. */
const BANK_BY_SKILL = (() => {
  const map = new Map<string, typeof REVIEWABLE_ITEMS>();
  for (const ref of REVIEWABLE_ITEMS) {
    if (ref.lessonId !== REVIEW_BANK_LESSON_ID) continue;
    const arr = map.get(ref.skillId);
    if (arr) arr.push(ref);
    else map.set(ref.skillId, [ref]);
  }
  return map;
})();

/**
 * Seed a skill's whole practice bank the first time the learner demonstrates
 * that skill in a lesson (mastery learning: don't drill what you haven't met).
 * Items are seeded as "new" with staggered due dates so a fresh variant becomes
 * available roughly each day rather than flooding the queue — this is what stops
 * review from recycling the same few problems. Idempotent via a sentinel doc.
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
      ...newItemSchedule(now, i),
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
 * scheduler, and bump lifetime stats. Returns the grade so the UI can react
 * (e.g. requeue an `again` item within the current session).
 */
export async function applyReviewResult(
  uid: string,
  item: ReviewItem,
  outcome: ReviewOutcome,
  now: number = Date.now(),
): Promise<Grade> {
  const grade = gradeOutcome(outcome);
  const next = scheduleNext(item, grade, now);
  await updateDoc(reviewItemRef(uid, item.itemKey), {
    ...next,
    lastResult: grade,
    attempts: item.attempts + 1,
    correctCount: item.correctCount + (outcome.correct ? 1 : 0),
  });
  return grade;
}
