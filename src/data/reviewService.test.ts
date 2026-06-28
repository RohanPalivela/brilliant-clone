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

import { getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { applyReviewResult, enrollSkillBank } from './reviewService';
import { scheduleNext, DAY_MS } from '../lib/srs';
import { REVIEWABLE_ITEMS } from '../content/skills';
import { REVIEW_BANK_LESSON_ID } from '../content/reviewBank';
import type { ReviewItem } from '../types/review';

type Mock = ReturnType<typeof vi.fn>;

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

describe('enrollSkillBank seeding', () => {
  const SKILL = 'coin-change'; // a skill with a deep bank (>= 2 variants)

  /** Capture every batch.set(ref, item) without touching Firestore. */
  function captureSeed() {
    const seeded: { itemKey: string; dueAt: number; createdAt: number }[] = [];
    (writeBatch as unknown as Mock).mockReturnValue({
      set: vi.fn((_ref: unknown, item: ReviewItem) =>
        seeded.push({
          itemKey: item.itemKey,
          dueAt: item.dueAt,
          createdAt: item.createdAt,
        }),
      ),
      commit: vi.fn().mockResolvedValue(undefined),
    });
    return seeded;
  }

  it('seeds the whole bank in ascending difficulty order', async () => {
    (getDoc as unknown as Mock).mockResolvedValue({ exists: () => false });
    const seeded = captureSeed();

    await enrollSkillBank('uid', SKILL);

    const expectedOrder = REVIEWABLE_ITEMS.filter(
      (r) => r.skillId === SKILL && r.lessonId === REVIEW_BANK_LESSON_ID,
    )
      .slice()
      .sort((a, b) => a.difficulty - b.difficulty)
      .map((r) => r.itemKey);

    expect(expectedOrder.length).toBeGreaterThan(1);
    expect(seeded.map((s) => s.itemKey)).toEqual(expectedOrder);
  });

  it('never makes a variant due on day 0, and fans them out one per day', async () => {
    (getDoc as unknown as Mock).mockResolvedValue({ exists: () => false });
    const seeded = captureSeed();

    await enrollSkillBank('uid', SKILL);

    // offsetDays = i + 1: the gentlest variant is due TOMORROW (not now), and
    // each subsequent variant is exactly one more day out — this is what stops a
    // multi-skill study session from spiking a single day's queue.
    seeded.forEach((s, i) => {
      expect(s.dueAt - s.createdAt).toBe((i + 1) * DAY_MS);
    });
    // Strictly increasing due dates → at most one new variant per day.
    for (let i = 1; i < seeded.length; i++) {
      expect(seeded[i].dueAt).toBeGreaterThan(seeded[i - 1].dueAt);
    }
  });

  it('is idempotent: an already-seeded bank is not re-seeded', async () => {
    (getDoc as unknown as Mock).mockResolvedValue({ exists: () => true });
    const batch = { set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) };
    (writeBatch as unknown as Mock).mockReturnValue(batch);

    await enrollSkillBank('uid', SKILL);

    expect(batch.set).not.toHaveBeenCalled();
    expect(batch.commit).not.toHaveBeenCalled();
  });
});
