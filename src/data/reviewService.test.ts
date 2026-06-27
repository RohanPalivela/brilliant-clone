import { describe, it, expect, vi, beforeEach } from 'vitest';

// Never touch real Firestore — stub the SDK surface reviewService imports.
// updateDoc resolves immediately so applyReviewResult's await is a no-op.
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn((..._args: unknown[]) => ({ path: _args.join('/') })),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  writeBatch: vi.fn(),
}));

import { updateDoc } from 'firebase/firestore';
import { applyReviewResult } from './reviewService';
import { scheduleNext } from '../lib/srs';
import type { ReviewItem } from '../types/review';

function makeItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    itemKey: 'l1__s1',
    courseId: 'c1',
    lessonId: 'l1',
    slideId: 's1',
    skillId: 'sk1',
    ease: 2.4,
    intervalDays: 20,
    reps: 5,
    lapses: 0,
    dueAt: 0,
    lastReviewedAt: 0,
    lastResult: 'good',
    attempts: 5,
    correctCount: 5,
    createdAt: 0,
    ...overrides,
  };
}

const NOW = 1_000_000;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('applyReviewResult', () => {
  it('returns the full post-attempt ReviewItem, preserving identity fields', async () => {
    const item = makeItem();
    const { grade, item: updated } = await applyReviewResult(
      'uid',
      item,
      { correct: true, usedHint: false, wrongAttempts: 0 },
      NOW,
    );

    expect(grade).toBe('good');
    // Identity carries through so the requeued copy is still the same problem.
    expect(updated.itemKey).toBe(item.itemKey);
    expect(updated.skillId).toBe(item.skillId);
    expect(updated.courseId).toBe(item.courseId);
    // Stats advanced.
    expect(updated.attempts).toBe(item.attempts + 1);
    expect(updated.correctCount).toBe(item.correctCount + 1);
    expect(updated.lastResult).toBe('good');
    // The returned scheduler state matches what was written to Firestore.
    expect(updateDoc).toHaveBeenCalledTimes(1);
    const written = (updateDoc as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(written.intervalDays).toBe(updated.intervalDays);
    expect(written.attempts).toBe(updated.attempts);
  });

  it('a failed attempt grades "again" and lapses to the post-lapse baseline', async () => {
    const item = makeItem({ reps: 5, intervalDays: 20, lapses: 0 });
    const { grade, item: updated } = await applyReviewResult(
      'uid',
      item,
      { correct: false, usedHint: false, wrongAttempts: 1 },
      NOW,
    );

    expect(grade).toBe('again');
    expect(updated.reps).toBe(0);
    expect(updated.intervalDays).toBe(1); // resurfaces tomorrow, not weeks out
    expect(updated.lapses).toBe(1);
  });

  it('the in-session requeue grades the SECOND attempt from the post-lapse baseline, not stale interval 20', async () => {
    const original = makeItem({ reps: 5, intervalDays: 20, lapses: 0 });

    // 1) Learner forgets a well-learned item → lapse write (fire-and-forget in UI).
    const failed = await applyReviewResult(
      'uid',
      original,
      { correct: false, usedHint: false, wrongAttempts: 1 },
      NOW,
    );

    // 2) ReviewPlayer.advance requeues a LOCAL post-attempt copy built from the
    //    pure scheduler — mirror that exact derivation here.
    const next = scheduleNext(original, 'again', NOW);
    const requeued: ReviewItem = {
      ...original,
      ...next,
      lastResult: 'again',
      attempts: original.attempts + 1,
      correctCount: original.correctCount,
    };
    expect(requeued).toEqual(failed.item);

    // 3) Second attempt succeeds, scheduled from the REQUEUED (post-lapse) copy.
    const passed = await applyReviewResult(
      'uid',
      requeued,
      { correct: true, usedHint: false, wrongAttempts: 0 },
      NOW,
    );

    // Scheduled from the post-lapse baseline (reps reset → 1, lapse recorded),
    // so the interval is short and starts climbing again — exactly the
    // scheduler's relearning path, NOT the stale pre-failure state.
    expect(passed.grade).toBe('good');
    expect(passed.item.reps).toBe(1);
    expect(passed.item.lapses).toBe(1);
    const expected = scheduleNext(requeued, 'good', NOW);
    expect(passed.item.intervalDays).toBe(expected.intervalDays);

    // Contrast: scheduling from the STALE pre-failure state (reps=5, interval=20)
    // would have pushed the item ~48 days out (round(20 * 2.4)). The fix must
    // resurface it within days instead.
    const stale = scheduleNext(original, 'good', NOW);
    expect(stale.intervalDays).toBe(48);
    expect(passed.item.intervalDays).toBeLessThan(stale.intervalDays);
    expect(passed.item.intervalDays).toBeLessThanOrEqual(7);

    // The two Firestore writes are consistent: the second builds on the post-
    // lapse baseline (reps=1) and never overwrites with the stale baseline (6).
    expect(updateDoc).toHaveBeenCalledTimes(2);
    const secondWrite = (updateDoc as unknown as ReturnType<typeof vi.fn>).mock.calls[1][1];
    expect(secondWrite.reps).toBe(1);
    expect(secondWrite.intervalDays).toBe(expected.intervalDays);
  });
});
