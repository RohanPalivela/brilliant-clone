import { describe, it, expect } from 'vitest';
import {
  DAY_MS,
  FAST_RECALL_MS,
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

  // FIX #5: post-lapse recovery is faster than a brand-new card.
  it('first good after a lapse recovers to the relearning interval, not 1 day', () => {
    // Brand-new (lapses 0) first success → 1 day.
    const fresh = scheduleNext({ ease: 2.4, intervalDays: 0, reps: 0, lapses: 0 }, 'good', NOW);
    expect(fresh.intervalDays).toBe(1);
    // Post-lapse (lapses > 0) first success → relearning interval (> 1).
    const relearn = scheduleNext({ ease: 2.4, intervalDays: 1, reps: 0, lapses: 1 }, 'good', NOW);
    expect(relearn.intervalDays).toBeGreaterThan(1);
    expect(relearn.reps).toBe(1);
  });

  it('second good after a lapse resumes multiplicative growth', () => {
    // A relearning card sitting at reps 1 (already recovered to 3d) climbs.
    const climbed = scheduleNext({ ease: 2.0, intervalDays: 3, reps: 1, lapses: 1 }, 'good', NOW);
    expect(climbed.intervalDays).toBe(Math.round(3 * 2.0));
    expect(climbed.intervalDays).toBeGreaterThan(3);
  });

  it('a good/again learner recovers above 1 day instead of being pinned forever', () => {
    let state = initialSchedule(NOW);
    const intervalsAfterGood: number[] = [];
    // Alternate good / again over several cycles.
    for (let cycle = 0; cycle < 6; cycle++) {
      state = { ...state, ...scheduleNext(state, 'good', NOW) };
      intervalsAfterGood.push(state.intervalDays);
      state = { ...state, ...scheduleNext(state, 'again', NOW) };
    }
    // The "good" rebound must rise above the 1-day floor (it would be pinned at
    // 1 under the old logic where every again reset reps to 0 -> next good = 1).
    expect(Math.max(...intervalsAfterGood)).toBeGreaterThan(1);
    // Lapses keep accumulating — one per `again`.
    expect(state.lapses).toBe(6);
    // Ease decays toward, but never below, the 1.3 floor.
    expect(state.ease).toBeGreaterThanOrEqual(1.3);
  });
});

describe('gradeOutcome', () => {
  it('maps recall quality to a grade', () => {
    expect(gradeOutcome({ correct: false, usedHint: false, wrongAttempts: 1 })).toBe('again');
    expect(gradeOutcome({ correct: true, usedHint: true, wrongAttempts: 0 })).toBe('hard');
    expect(gradeOutcome({ correct: true, usedHint: false, wrongAttempts: 2 })).toBe('hard');
    // Clean recall with no timing signal stays `good` (back-compat).
    expect(gradeOutcome({ correct: true, usedHint: false, wrongAttempts: 0 })).toBe('good');
  });

  // FIX #4: the `easy` grade used to be unreachable. A clean recall that is
  // also fast now grades `easy`; clean-but-slow (or untimed) stays `good`.
  it('grades a clean + fast recall as easy', () => {
    expect(
      gradeOutcome({ correct: true, usedHint: false, wrongAttempts: 0, elapsedMs: FAST_RECALL_MS - 1 }),
    ).toBe('easy');
    // Boundary: exactly at the threshold still counts as fast.
    expect(
      gradeOutcome({ correct: true, usedHint: false, wrongAttempts: 0, elapsedMs: FAST_RECALL_MS }),
    ).toBe('easy');
  });

  it('grades a clean but slow recall as good', () => {
    expect(
      gradeOutcome({ correct: true, usedHint: false, wrongAttempts: 0, elapsedMs: FAST_RECALL_MS + 1 }),
    ).toBe('good');
  });

  it('grades a clean recall with no timing as good (back-compat)', () => {
    expect(gradeOutcome({ correct: true, usedHint: false, wrongAttempts: 0 })).toBe('good');
  });

  it('treats a fast but hinted recall as hard, not easy', () => {
    expect(
      gradeOutcome({ correct: true, usedHint: true, wrongAttempts: 0, elapsedMs: 100 }),
    ).toBe('hard');
  });
});

describe('mastery', () => {
  // FIX #2: strength caps via the interval but now also decays with elapsed
  // time. itemStrength takes `now` and reads lastReviewedAt.
  it('strength scales with interval (capped) for a freshly-reviewed item', () => {
    expect(itemStrength({ intervalDays: 0, reps: 0, lastReviewedAt: NOW }, NOW)).toBe(0);
    // Reviewed just now → retrievability ≈ 1, so strength reflects the interval.
    expect(itemStrength({ intervalDays: 21, reps: 4, lastReviewedAt: NOW }, NOW)).toBe(1);
    expect(itemStrength({ intervalDays: 42, reps: 6, lastReviewedAt: NOW }, NOW)).toBe(1);
  });

  it('decays strength as an item becomes overdue', () => {
    // Mastered item, reviewed just now → strength 1, level "mastered".
    const fresh = itemStrength({ intervalDays: 21, reps: 4, lastReviewedAt: NOW }, NOW);
    expect(fresh).toBe(1);
    expect(levelFromStrength(fresh)).toBe('mastered');

    // Same item, 100 days later → R = 21/100, strength clearly decayed and no
    // longer "mastered".
    const stale = itemStrength(
      { intervalDays: 21, reps: 4, lastReviewedAt: NOW },
      NOW + 100 * DAY_MS,
    );
    expect(stale).toBeCloseTo(21 / 100, 5);
    expect(stale).toBeLessThan(0.5);
    expect(levelFromStrength(stale)).not.toBe('mastered');
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
    expect(summary[0].practiced).toBe(2);
    expect(summary[0].due).toBe(1);
  });

  // FIX #3: averaging over PRACTICED items only — seeded reps=0 variants must
  // not dilute a demonstrated skill.
  it('averages strength over practiced items only, not seeded reps=0 variants', () => {
    const skills: ReviewSkill[] = [
      { id: 'reachability-sweep', name: 'R', blurb: '', order: 1 },
    ];
    const strong = item({
      itemKey: 'strong',
      skillId: 'reachability-sweep',
      intervalDays: 21,
      reps: 4,
      lastReviewedAt: NOW,
      dueAt: NOW + DAY_MS,
    });
    const seeded = Array.from({ length: 8 }, (_, i) =>
      item({
        itemKey: `seed-${i}`,
        skillId: 'reachability-sweep',
        intervalDays: 0,
        reps: 0,
        lastReviewedAt: NOW,
        dueAt: NOW + i * DAY_MS,
      }),
    );
    const summary = summarizeMastery([strong, ...seeded], skills, NOW);
    expect(summary).toHaveLength(1);
    expect(summary[0].total).toBe(9);
    expect(summary[0].practiced).toBe(1);
    // Strength reflects the one practiced item, NOT diluted by 8 zeros.
    expect(summary[0].strength).toBeCloseTo(
      itemStrength(strong, NOW),
      5,
    );
    expect(summary[0].strength).toBe(1);
    expect(summary[0].level).toBe('mastered');
  });

  it('reports strength 0 for a skill with no practiced items', () => {
    const skills: ReviewSkill[] = [
      { id: 'reachability-sweep', name: 'R', blurb: '', order: 1 },
    ];
    const seeded = [
      item({ itemKey: 's1', skillId: 'reachability-sweep', intervalDays: 0, reps: 0 }),
      item({ itemKey: 's2', skillId: 'reachability-sweep', intervalDays: 0, reps: 0 }),
    ];
    const summary = summarizeMastery(seeded, skills, NOW);
    expect(summary[0].total).toBe(2);
    expect(summary[0].practiced).toBe(0);
    expect(summary[0].strength).toBe(0);
    expect(summary[0].level).toBe('learning');
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
