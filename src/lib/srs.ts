// Spaced-repetition scheduler — a lightweight SM-2 variant.
//
// Pure, deterministic, and unit-testable: given an item's current scheduler
// state and how the latest recall went, it returns the next interval and due
// date. Growing intervals on success implement the spacing effect; a lapse
// resets reps and resurfaces the item sooner, exactly as Phase 3 calls for.

import type {
  Grade,
  MasteryLevel,
  ReviewItem,
  ReviewOutcome,
  ReviewSkill,
  SkillMastery,
  SrsState,
} from '../types/review';

export const DAY_MS = 86_400_000;

const DEFAULT_EASE = 2.4;
const MIN_EASE = 1.3;
/** Interval for the first successful recall after learning. */
const FIRST_INTERVAL = 1;
/** Interval for the second successful recall. */
const SECOND_INTERVAL = 3;
/** Where a forgotten item lands: resurface it tomorrow, not weeks later. */
const LAPSE_INTERVAL = 1;

const round = (n: number) => Math.round(n);
const clampEase = (e: number) => Math.max(MIN_EASE, e);

/**
 * Scheduler state for a problem the learner just solved inside a lesson. It
 * enters the pool as a single successful recall, due tomorrow.
 */
export function initialSchedule(now: number = Date.now()): SrsState {
  return {
    ease: DEFAULT_EASE,
    intervalDays: FIRST_INTERVAL,
    reps: 1,
    lapses: 0,
    dueAt: now + FIRST_INTERVAL * DAY_MS,
    lastReviewedAt: now,
  };
}

/**
 * Scheduler state for a bank problem the learner has NOT practiced yet — it is
 * seeded as "new" (no reps, zero strength) so it doesn't inflate mastery, and
 * becomes due after `offsetDays` so fresh variants trickle in over time instead
 * of arriving all at once.
 */
export function newItemSchedule(
  now: number = Date.now(),
  offsetDays = 0,
): SrsState {
  return {
    ease: DEFAULT_EASE,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    dueAt: now + offsetDays * DAY_MS,
    lastReviewedAt: now,
  };
}

/**
 * Compute the next scheduler state from the previous one and a grade.
 *
 * - `again`  -> lapse: reset reps, drop ease, due again tomorrow.
 * - `hard`   -> shorter-than-normal growth, ease down a touch.
 * - `good`   -> standard SM-2 growth (1d, 3d, then * ease).
 * - `easy`   -> faster growth, ease up.
 */
export function scheduleNext(
  prev: Pick<ReviewItem, 'ease' | 'intervalDays' | 'reps' | 'lapses'>,
  grade: Grade,
  now: number = Date.now(),
): SrsState {
  let { ease, reps, lapses } = prev;
  let intervalDays = prev.intervalDays;

  if (grade === 'again') {
    reps = 0;
    lapses += 1;
    ease = clampEase(ease - 0.2);
    intervalDays = LAPSE_INTERVAL;
  } else {
    if (reps <= 0) intervalDays = FIRST_INTERVAL;
    else if (reps === 1) intervalDays = SECOND_INTERVAL;
    else intervalDays = round(intervalDays * ease);

    if (grade === 'hard') {
      ease = clampEase(ease - 0.15);
      intervalDays = Math.max(FIRST_INTERVAL, round(intervalDays * 0.8));
    } else if (grade === 'easy') {
      ease = ease + 0.15;
      intervalDays = round(intervalDays * 1.3);
    }
    reps += 1;
  }

  return {
    ease,
    intervalDays,
    reps,
    lapses,
    dueAt: now + intervalDays * DAY_MS,
    lastReviewedAt: now,
  };
}

/**
 * Auto-grade a review attempt. We don't ask the learner to self-rate — we infer
 * the grade from how the recall actually went, which keeps the loop honest:
 * a clean first-try recall grows the interval fastest; needing a hint or a retry
 * counts as "hard"; failing to recall is "again".
 */
export function gradeOutcome(outcome: ReviewOutcome): Grade {
  if (!outcome.correct) return 'again';
  if (outcome.usedHint || outcome.wrongAttempts > 0) return 'hard';
  return 'good';
}

// ---------------------------------------------------------------------------
// Mastery signal (beyond "completed the lesson")
// ---------------------------------------------------------------------------

/** Interval (days) at which an item counts as fully mastered. */
const MASTERED_INTERVAL = 21;

/** Memory strength for one item, 0..1, based on how far its interval has grown. */
export function itemStrength(item: Pick<ReviewItem, 'intervalDays' | 'reps'>): number {
  if (item.reps <= 0) return 0;
  return Math.min(1, item.intervalDays / MASTERED_INTERVAL);
}

export function levelFromStrength(strength: number): MasteryLevel {
  if (strength >= 0.85) return 'mastered';
  if (strength >= 0.45) return 'strong';
  if (strength > 0.1) return 'familiar';
  return 'learning';
}

/**
 * Aggregate a learner's review items into per-skill mastery, one entry per skill
 * the learner has started. Skills with no enrolled items are omitted.
 */
export function summarizeMastery(
  items: ReviewItem[],
  skills: ReviewSkill[],
  now: number = Date.now(),
): SkillMastery[] {
  const bySkill = new Map<string, ReviewItem[]>();
  for (const item of items) {
    const arr = bySkill.get(item.skillId);
    if (arr) arr.push(item);
    else bySkill.set(item.skillId, [item]);
  }

  return skills
    .filter((s) => bySkill.has(s.id))
    .map((skill) => {
      const group = bySkill.get(skill.id)!;
      const strength =
        group.reduce((sum, it) => sum + itemStrength(it), 0) / group.length;
      const due = group.filter((it) => it.dueAt <= now).length;
      return {
        skill,
        total: group.length,
        due,
        strength,
        level: levelFromStrength(strength),
      };
    })
    .sort((a, b) => a.skill.order - b.skill.order);
}

// ---------------------------------------------------------------------------
// Interleaving
// ---------------------------------------------------------------------------

/** Human-friendly "in 3 days" / "in 5 hours" for a due date. */
export function formatDueDistance(dueAt: number, now: number = Date.now()): string {
  const ms = dueAt - now;
  if (ms <= 0) return 'now';
  const days = Math.round(ms / DAY_MS);
  if (days >= 1) return `in ${days} day${days === 1 ? '' : 's'}`;
  const hours = Math.max(1, Math.round(ms / 3_600_000));
  return `in ${hours} hour${hours === 1 ? '' : 's'}`;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Order a set of due items so consecutive problems train *different* DP
 * patterns wherever possible. Blocked practice (all staircase, then all coin
 * change) lets learners coast on the last pattern they saw; interleaving forces
 * them to first ask "which recurrence is this?" — the discrimination skill that
 * actually transfers. Within a pattern, the most overdue item comes first.
 */
export function interleave(items: ReviewItem[]): ReviewItem[] {
  const buckets = new Map<string, ReviewItem[]>();
  for (const item of items) {
    const arr = buckets.get(item.skillId);
    if (arr) arr.push(item);
    else buckets.set(item.skillId, [item]);
  }
  for (const arr of buckets.values()) arr.sort((a, b) => a.dueAt - b.dueAt);

  const out: ReviewItem[] = [];
  while (out.length < items.length) {
    // Reshuffle the skill order each round so the interleave pattern itself
    // isn't predictable across a session.
    for (const skillId of shuffle([...buckets.keys()])) {
      const arr = buckets.get(skillId)!;
      const next = arr.shift();
      if (next) out.push(next);
      if (arr.length === 0) buckets.delete(skillId);
    }
  }
  return out;
}
