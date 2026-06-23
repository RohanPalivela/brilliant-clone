// Streak rules (PRD Section 13.1): a day counts as qualifying when the learner
// completes >= 1 lesson OR >= 3 checked interactive problems. Miss a day -> reset.

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Whole-day difference (b - a) for YYYY-MM-DD keys, calendar based. */
export function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  const ms = db.getTime() - da.getTime();
  return Math.round(ms / 86_400_000);
}

export interface StreakState {
  streak: number;
  lastActivityDate: string;
  todayKey: string;
  problemsSolvedToday: number;
  lessonsCompletedToday: number;
}

export interface ActivityDelta {
  lessonsCompleted?: number;
  problemsSolved?: number;
}

export interface StreakUpdate extends StreakState {
  /** True when this activity extended (or started) the streak today. */
  streakExtended: boolean;
}

/**
 * Apply an activity to the streak state. Resets the per-day counters when the
 * day rolls over, then extends the streak the first time the day qualifies.
 */
export function applyActivity(
  state: StreakState,
  delta: ActivityDelta,
  today: string = dateKey(),
): StreakUpdate {
  let { streak, lastActivityDate, problemsSolvedToday, lessonsCompletedToday } =
    state;

  // Roll counters over to the new day.
  if (state.todayKey !== today) {
    problemsSolvedToday = 0;
    lessonsCompletedToday = 0;
  }

  problemsSolvedToday += delta.problemsSolved ?? 0;
  lessonsCompletedToday += delta.lessonsCompleted ?? 0;

  const qualifies = lessonsCompletedToday >= 1 || problemsSolvedToday >= 3;
  let streakExtended = false;

  if (qualifies && lastActivityDate !== today) {
    const gap = lastActivityDate ? daysBetween(lastActivityDate, today) : Infinity;
    streak = gap === 1 ? streak + 1 : 1;
    lastActivityDate = today;
    streakExtended = true;
  }

  return {
    streak,
    lastActivityDate,
    todayKey: today,
    problemsSolvedToday,
    lessonsCompletedToday,
    streakExtended,
  };
}

/**
 * Returns the streak the learner should *see* right now: if they missed more
 * than a day since their last qualifying activity, the displayed streak is 0.
 */
export function effectiveStreak(
  streak: number,
  lastActivityDate: string,
  today: string = dateKey(),
): number {
  if (!lastActivityDate) return 0;
  const gap = daysBetween(lastActivityDate, today);
  return gap <= 1 ? streak : 0;
}
