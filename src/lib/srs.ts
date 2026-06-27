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
/**
 * Interval for the FIRST successful recall *after a lapse* (relearning). A
 * lapsed card once held durable memory, so it recovers faster than a brand-new
 * card (which restarts at FIRST_INTERVAL = 1 day). This is what stops a
 * good/again/good/again learner from being pinned at a 1-day interval forever.
 */
const RELEARN_INTERVAL = 3;
/**
 * Below this answer time (ms) a clean first-try recall counts as `easy`.
 * Exported so other layers can mirror the "fast" threshold if needed.
 */
export const FAST_RECALL_MS = 8000;

const round = (n: number) => Math.round(n);
const clampEase = (e: number) => Math.max(MIN_EASE, e);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

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
 *
 * Relearning: a card is "post-lapse" when reps === 0 but lapses > 0 (a brand
 * new card has reps === 0 AND lapses === 0). On the first success after a lapse
 * we jump straight to RELEARN_INTERVAL instead of 1 day, and the second success
 * resumes multiplicative growth — so a recovered card climbs again rather than
 * being knocked back to a 1-day interval on every good/again cycle.
 */
export function scheduleNext(
  prev: Pick<ReviewItem, 'ease' | 'intervalDays' | 'reps' | 'lapses'>,
  grade: Grade,
  now: number = Date.now(),
): SrsState {
  let { ease, reps, lapses } = prev;
  let intervalDays = prev.intervalDays;
  const relearning = lapses > 0;

  if (grade === 'again') {
    reps = 0;
    lapses += 1;
    ease = clampEase(ease - 0.2);
    intervalDays = LAPSE_INTERVAL;
  } else {
    if (reps <= 0) {
      // First success: brand-new card restarts at 1 day; a relearning card
      // recovers faster to RELEARN_INTERVAL.
      intervalDays = relearning ? RELEARN_INTERVAL : FIRST_INTERVAL;
    } else if (reps === 1) {
      // Second success: brand-new card steps to SECOND_INTERVAL; a relearning
      // card (already at RELEARN_INTERVAL) resumes interval * ease growth.
      intervalDays = relearning ? round(intervalDays * ease) : SECOND_INTERVAL;
    } else {
      intervalDays = round(intervalDays * ease);
    }

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
 *
 * A *clean* recall (correct, no hint, no wrong attempts) grades `easy` only when
 * it was also FAST (elapsedMs <= FAST_RECALL_MS); a clean-but-slow recall — or
 * one with no timing signal at all — stays `good` (back-compat).
 */
export function gradeOutcome(outcome: ReviewOutcome): Grade {
  if (!outcome.correct) return 'again';
  if (outcome.usedHint || outcome.wrongAttempts > 0) return 'hard';
  if (outcome.elapsedMs != null && outcome.elapsedMs <= FAST_RECALL_MS) return 'easy';
  return 'good';
}

// ---------------------------------------------------------------------------
// Mastery signal (beyond "completed the lesson")
// ---------------------------------------------------------------------------

/** Interval (days) at which an item counts as fully mastered. */
const MASTERED_INTERVAL = 21;

/**
 * Memory strength for one item, 0..1, combining how far its interval has grown
 * with how *retrievable* it still is right now.
 *
 *   stability      = min(1, intervalDays / MASTERED_INTERVAL)
 *   elapsedDays    = (now - lastReviewedAt) / day
 *   retrievability = clamp01(intervalDays / max(intervalDays, elapsedDays))
 *   strength       = stability * retrievability
 *
 * An item reviewed recently (elapsed << interval) keeps retrievability ≈ 1, so
 * strength reflects its interval. An item left well past its interval decays:
 * being 100 days overdue on a 21-day interval no longer reports "mastered".
 * Unpracticed items (reps <= 0) have zero strength.
 */
export function itemStrength(
  item: Pick<ReviewItem, 'intervalDays' | 'reps' | 'lastReviewedAt'>,
  now: number = Date.now(),
): number {
  if (item.reps <= 0 || item.intervalDays <= 0) return 0;
  const stability = Math.min(1, item.intervalDays / MASTERED_INTERVAL);
  const elapsedDays = Math.max(0, (now - item.lastReviewedAt) / DAY_MS);
  const denom = Math.max(item.intervalDays, elapsedDays);
  const retrievability = denom <= 0 ? 1 : clamp01(item.intervalDays / denom);
  return stability * retrievability;
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
      // Average strength over PRACTICED items only. Freshly-seeded bank
      // variants (reps === 0, strength 0) would otherwise dilute mastery —
      // demonstrating a skill once shouldn't drop it from 100% to ~11%.
      const practicedItems = group.filter((it) => it.reps > 0);
      const strength = practicedItems.length
        ? practicedItems.reduce((sum, it) => sum + itemStrength(it, now), 0) /
          practicedItems.length
        : 0;
      const due = group.filter((it) => it.dueAt <= now).length;
      return {
        skill,
        total: group.length,
        practiced: practicedItems.length,
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
