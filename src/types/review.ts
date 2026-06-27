// Spaced-repetition (Phase 3 "learning science") documents and value types.
//
// Brilliant nails the testing effect but ignores the spacing effect: learners
// feel fluent in-session, then forget. The Pattern Review Engine schedules each
// learned problem to return at growing intervals and resurfaces missed ones
// sooner, so the DP recurrence patterns (staircase -> coin change -> knapsack)
// build durable, transferable memory instead of one-session understanding.

/** How well the learner recalled an item — drives the next interval. */
export type Grade = 'again' | 'hard' | 'good' | 'easy';

/**
 * One reviewable problem in a learner's spaced-repetition pool. Persisted at
 * `users/{uid}/reviewItems/{itemKey}` where `itemKey = ${lessonId}__${slideId}`.
 * The scheduler fields follow a lightweight SM-2 variant.
 */
export interface ReviewItem {
  /** `${lessonId}__${slideId}` — stable id of the underlying activity slide. */
  itemKey: string;
  courseId: string;
  lessonId: string;
  slideId: string;
  /** DP pattern this problem trains (see content/skills.ts). */
  skillId: string;

  // --- scheduler state ---
  /** Easiness factor; larger = intervals grow faster. Clamped at MIN_EASE. */
  ease: number;
  /** Current spacing interval in days. */
  intervalDays: number;
  /** Consecutive successful recalls (resets to 0 on a lapse). */
  reps: number;
  /** Times the item was forgotten after having been learned. */
  lapses: number;
  /** Epoch ms when the item next becomes due for review. */
  dueAt: number;
  /** Epoch ms of the most recent review (or enrollment). */
  lastReviewedAt: number;
  /** Grade from the most recent review, or null right after enrollment. */
  lastResult: Grade | null;

  // --- lifetime stats (mastery signal) ---
  attempts: number;
  correctCount: number;
  createdAt: number;
}

/** Mutable scheduler fields the SRS algorithm computes for the next review. */
export type SrsState = Pick<
  ReviewItem,
  'ease' | 'intervalDays' | 'reps' | 'lapses' | 'dueAt' | 'lastReviewedAt'
>;

/** A DP pattern a learner practices and can master over time. */
export interface ReviewSkill {
  id: string;
  /** Short name shown on the mastery map. */
  name: string;
  /** One-line description of the pattern. */
  blurb: string;
  /** Display order on the mastery map. */
  order: number;
}

/** How strong a learner's memory of an item/skill is, derived from intervals. */
export type MasteryLevel = 'learning' | 'familiar' | 'strong' | 'mastered';

/** Aggregated mastery for a single skill across all its enrolled items. */
export interface SkillMastery {
  skill: ReviewSkill;
  /** Items the learner has enrolled (solved at least once) in this skill. */
  total: number;
  /** How many of those items are due for review right now. */
  due: number;
  /** Average memory strength across the skill's items, 0..1. */
  strength: number;
  level: MasteryLevel;
}

/** The outcome of a single review attempt, fed to the grader. */
export interface ReviewOutcome {
  correct: boolean;
  usedHint: boolean;
  wrongAttempts: number;
}
