import { describe, it, expect } from 'vitest';
import {
  dateKey,
  daysBetween,
  applyActivity,
  effectiveStreak,
  type StreakState,
} from './streak';

describe('dateKey', () => {
  it('formats a date as YYYY-MM-DD with zero padding', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('daysBetween', () => {
  it('counts whole calendar days', () => {
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0);
    expect(daysBetween('2026-01-01', '2026-01-02')).toBe(1);
    expect(daysBetween('2026-01-01', '2026-01-08')).toBe(7);
  });

  it('handles month boundaries', () => {
    expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1);
  });

  it('is negative when b precedes a', () => {
    expect(daysBetween('2026-01-02', '2026-01-01')).toBe(-1);
  });
});

function freshState(overrides: Partial<StreakState> = {}): StreakState {
  return {
    streak: 0,
    lastActivityDate: '',
    todayKey: '2026-01-01',
    problemsSolvedToday: 0,
    lessonsCompletedToday: 0,
    ...overrides,
  };
}

describe('applyActivity', () => {
  it('starts a streak at 1 when the first lesson is completed', () => {
    const next = applyActivity(freshState(), { lessonsCompleted: 1 }, '2026-01-01');
    expect(next.streak).toBe(1);
    expect(next.streakExtended).toBe(true);
    expect(next.lastActivityDate).toBe('2026-01-01');
  });

  it('requires 3 problems in a day to qualify', () => {
    let state = freshState();
    const after1 = applyActivity(state, { problemsSolved: 1 }, '2026-01-01');
    expect(after1.streak).toBe(0);
    expect(after1.streakExtended).toBe(false);

    const after2 = applyActivity(after1, { problemsSolved: 1 }, '2026-01-01');
    expect(after2.streak).toBe(0);

    const after3 = applyActivity(after2, { problemsSolved: 1 }, '2026-01-01');
    expect(after3.problemsSolvedToday).toBe(3);
    expect(after3.streak).toBe(1);
    expect(after3.streakExtended).toBe(true);
  });

  it('does not double-count a second qualifying activity on the same day', () => {
    const day1 = applyActivity(freshState(), { lessonsCompleted: 1 }, '2026-01-01');
    const again = applyActivity(day1, { lessonsCompleted: 1 }, '2026-01-01');
    expect(again.streak).toBe(1);
    expect(again.streakExtended).toBe(false);
  });

  it('increments the streak on a consecutive day', () => {
    const day1 = applyActivity(freshState(), { lessonsCompleted: 1 }, '2026-01-01');
    const day2 = applyActivity(day1, { lessonsCompleted: 1 }, '2026-01-02');
    expect(day2.streak).toBe(2);
    expect(day2.streakExtended).toBe(true);
  });

  it('resets the streak to 1 after a gap of more than one day', () => {
    const day1 = applyActivity(freshState(), { lessonsCompleted: 1 }, '2026-01-01');
    const day5 = applyActivity(day1, { lessonsCompleted: 1 }, '2026-01-05');
    expect(day5.streak).toBe(1);
  });

  it('rolls per-day counters over when the day changes', () => {
    const day1 = applyActivity(
      freshState({ problemsSolvedToday: 2 }),
      { problemsSolved: 2 },
      '2026-01-01',
    );
    expect(day1.problemsSolvedToday).toBe(4);
    // New day: counters reset before adding the new activity.
    const day2 = applyActivity(day1, { problemsSolved: 1 }, '2026-01-02');
    expect(day2.problemsSolvedToday).toBe(1);
  });
});

describe('effectiveStreak', () => {
  it('shows the streak when the last activity was today or yesterday', () => {
    expect(effectiveStreak(5, '2026-01-10', '2026-01-10')).toBe(5);
    expect(effectiveStreak(5, '2026-01-10', '2026-01-11')).toBe(5);
  });

  it('shows 0 when more than a day has passed', () => {
    expect(effectiveStreak(5, '2026-01-10', '2026-01-12')).toBe(0);
  });

  it('shows 0 when there is no recorded activity', () => {
    expect(effectiveStreak(5, '', '2026-01-12')).toBe(0);
  });
});
