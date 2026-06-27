import { describe, it, expect } from 'vitest';
import {
  DAY_MS,
  initialSchedule,
  scheduleNext,
  gradeOutcome,
  itemStrength,
  levelFromStrength,
  summarizeMastery,
  interleave,
  formatDueDistance,
} from './srs';
import type { ReviewItem, ReviewSkill } from '../types/review';

const NOW = 1_700_000_000_000;

function item(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    itemKey: 'lesson__slide',
    courseId: 'c',
    lessonId: 'lesson',
    slideId: 'slide',
    skillId: 'reachability-sweep',
    ease: 2.4,
    intervalDays: 1,
    reps: 1,
    lapses: 0,
    dueAt: NOW,
    lastReviewedAt: NOW,
    lastResult: 'good',
    attempts: 1,
    correctCount: 1,
    createdAt: NOW,
    ...overrides,
  };
}

describe('initialSchedule', () => {
  it('enters as one successful recall due tomorrow', () => {
    const s = initialSchedule(NOW);
    expect(s.reps).toBe(1);
    expect(s.intervalDays).toBe(1);
    expect(s.dueAt).toBe(NOW + DAY_MS);
  });
});

describe('scheduleNext', () => {
  it('grows intervals on consecutive good recalls (1d -> 3d -> *ease)', () => {
    const a = scheduleNext({ ease: 2.4, intervalDays: 1, reps: 1, lapses: 0 }, 'good', NOW);
    expect(a.intervalDays).toBe(3);
    const b = scheduleNext({ ease: 2.4, intervalDays: 3, reps: 2, lapses: 0 }, 'good', NOW);
    expect(b.intervalDays).toBe(Math.round(3 * 2.4));
    expect(b.dueAt).toBe(NOW + b.intervalDays * DAY_MS);
  });

  it('resurfaces a forgotten item tomorrow and drops ease', () => {
    const r = scheduleNext({ ease: 2.4, intervalDays: 20, reps: 5, lapses: 0 }, 'again', NOW);
    expect(r.reps).toBe(0);
    expect(r.lapses).toBe(1);
    expect(r.intervalDays).toBe(1);
    expect(r.ease).toBeCloseTo(2.2);
  });

  it('never drops ease below the floor', () => {
    let ease = 1.3;
    for (let i = 0; i < 5; i++) {
      ease = scheduleNext({ ease, intervalDays: 5, reps: 3, lapses: 0 }, 'again', NOW).ease;
    }
    expect(ease).toBeGreaterThanOrEqual(1.3);
  });

  it('hard grows slower than good', () => {
    const hard = scheduleNext({ ease: 2.4, intervalDays: 10, reps: 3, lapses: 0 }, 'hard', NOW);
    const good = scheduleNext({ ease: 2.4, intervalDays: 10, reps: 3, lapses: 0 }, 'good', NOW);
    expect(hard.intervalDays).toBeLessThan(good.intervalDays);
  });
});

describe('gradeOutcome', () => {
  it('maps recall quality to a grade', () => {
    expect(gradeOutcome({ correct: false, usedHint: false, wrongAttempts: 1 })).toBe('again');
    expect(gradeOutcome({ correct: true, usedHint: true, wrongAttempts: 0 })).toBe('hard');
    expect(gradeOutcome({ correct: true, usedHint: false, wrongAttempts: 2 })).toBe('hard');
    expect(gradeOutcome({ correct: true, usedHint: false, wrongAttempts: 0 })).toBe('good');
  });
});

describe('mastery', () => {
  it('strength scales with interval and caps at 1', () => {
    expect(itemStrength({ intervalDays: 0, reps: 0 })).toBe(0);
    expect(itemStrength({ intervalDays: 21, reps: 4 })).toBe(1);
    expect(itemStrength({ intervalDays: 42, reps: 6 })).toBe(1);
  });

  it('labels levels from strength', () => {
    expect(levelFromStrength(0)).toBe('learning');
    expect(levelFromStrength(0.3)).toBe('familiar');
    expect(levelFromStrength(0.6)).toBe('strong');
    expect(levelFromStrength(0.9)).toBe('mastered');
  });

  it('summarizes per skill and counts due items', () => {
    const skills: ReviewSkill[] = [
      { id: 'reachability-sweep', name: 'R', blurb: '', order: 1 },
      { id: 'coin-change', name: 'C', blurb: '', order: 2 },
    ];
    const items = [
      item({ itemKey: 'a', skillId: 'reachability-sweep', intervalDays: 21, reps: 4, dueAt: NOW + DAY_MS }),
      item({ itemKey: 'b', skillId: 'reachability-sweep', intervalDays: 1, reps: 1, dueAt: NOW - 1 }),
    ];
    const summary = summarizeMastery(items, skills, NOW);
    expect(summary).toHaveLength(1);
    expect(summary[0].skill.id).toBe('reachability-sweep');
    expect(summary[0].total).toBe(2);
    expect(summary[0].due).toBe(1);
  });
});

describe('interleave', () => {
  it('preserves all items and avoids long same-skill runs', () => {
    const items = [
      item({ itemKey: 'r1', skillId: 'reachability-sweep' }),
      item({ itemKey: 'r2', skillId: 'reachability-sweep' }),
      item({ itemKey: 'r3', skillId: 'reachability-sweep' }),
      item({ itemKey: 'c1', skillId: 'coin-change' }),
      item({ itemKey: 'c2', skillId: 'coin-change' }),
      item({ itemKey: 'c3', skillId: 'coin-change' }),
    ];
    const out = interleave(items);
    expect(out).toHaveLength(6);
    expect(new Set(out.map((i) => i.itemKey)).size).toBe(6);
    let maxRun = 1;
    let run = 1;
    for (let i = 1; i < out.length; i++) {
      run = out[i].skillId === out[i - 1].skillId ? run + 1 : 1;
      maxRun = Math.max(maxRun, run);
    }
    // With two equal-size buckets, a perfect alternation has no runs > 1.
    expect(maxRun).toBeLessThanOrEqual(2);
  });
});

describe('formatDueDistance', () => {
  it('describes due dates relative to now', () => {
    expect(formatDueDistance(NOW - 1, NOW)).toBe('now');
    expect(formatDueDistance(NOW + 3 * DAY_MS, NOW)).toBe('in 3 days');
    expect(formatDueDistance(NOW + 2 * 3_600_000, NOW)).toBe('in 2 hours');
  });
});
