import { describe, it, expect } from 'vitest';
import {
  computeReachable,
  lookbackIndices,
  minCoinsTable,
  knapsackTable,
  knapsackOptimal,
  UNREACHABLE,
  type KnapsackItemLike,
} from './dp';

/** Indices i where reachable[i] is true. */
function reachableSet(reachable: boolean[]): number[] {
  return reachable.flatMap((r, i) => (r ? [i] : []));
}

describe('computeReachable', () => {
  it('matches the Lesson 1 answer key (jumps 3,5 / target 11)', () => {
    const reachable = computeReachable(11, [3, 5]);
    expect(reachable).toHaveLength(12);
    expect(reachableSet(reachable)).toEqual([0, 3, 5, 6, 8, 9, 10, 11]);
    // Dead-ends spelled out for clarity.
    for (const dead of [1, 2, 4, 7]) {
      expect(reachable[dead]).toBe(false);
    }
  });

  it('matches the Lesson 3 answer key (jumps 2,3,4 / target 11)', () => {
    const reachable = computeReachable(11, [2, 3, 4]);
    // Only step 1 is unreachable with small contiguous jumps.
    expect(reachableSet(reachable)).toEqual([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(reachable[1]).toBe(false);
  });

  it('matches the capstone answer key (jumps 3,7 / target 13)', () => {
    const reachable = computeReachable(13, [3, 7]);
    expect(reachableSet(reachable)).toEqual([0, 3, 6, 7, 9, 10, 12, 13]);
    for (const dead of [1, 2, 4, 5, 8, 11]) {
      expect(reachable[dead]).toBe(false);
    }
  });

  it('always marks the ground (step 0) reachable', () => {
    expect(computeReachable(0, [3, 5])).toEqual([true]);
    expect(computeReachable(5, [])[0]).toBe(true);
  });

  it('with no jumps, only the ground is reachable', () => {
    expect(computeReachable(4, [])).toEqual([true, false, false, false, false]);
  });

  it('handles a single jump size', () => {
    // Jumps of exactly 2: every even step is reachable.
    const reachable = computeReachable(6, [2]);
    expect(reachableSet(reachable)).toEqual([0, 2, 4, 6]);
  });
});

describe('lookbackIndices', () => {
  it('returns the predecessors that decide a step (sorted ascending)', () => {
    expect(lookbackIndices(11, [3, 5])).toEqual([6, 8]);
    expect(lookbackIndices(13, [3, 7])).toEqual([6, 10]);
  });

  it('clamps out predecessors below the ground', () => {
    expect(lookbackIndices(2, [3, 5])).toEqual([]);
    expect(lookbackIndices(4, [3, 5])).toEqual([1]); // 4-5 is negative, dropped
  });

  it('returns predecessors sorted even when jumps are given out of order', () => {
    expect(lookbackIndices(11, [5, 3])).toEqual([6, 8]);
  });

  it('cross-checks against computeReachable: a step is reachable iff a lookback is', () => {
    const reachable = computeReachable(11, [3, 5]);
    for (let i = 1; i <= 11; i++) {
      const expected = lookbackIndices(i, [3, 5]).some((p) => reachable[p]);
      expect(reachable[i]).toBe(expected);
    }
  });
});

describe('minCoinsTable', () => {
  it('matches the Lesson 6 answer key (coins 1,3,4 / amount 6)', () => {
    // 0,1,2,3,4,5,6 -> 0,1,2,1,1,2,2 (and 6 = 3+3, beating greedy 4+1+1)
    expect(minCoinsTable([1, 3, 4], 6)).toEqual([0, 1, 2, 1, 1, 2, 2]);
  });

  it('uses fewest coins, not the greedy biggest-first count', () => {
    // Greedy on {1,3,4} for 6 gives 4+1+1 = 3 coins; optimal is 3+3 = 2.
    expect(minCoinsTable([1, 3, 4], 6)[6]).toBe(2);
  });

  it('marks amounts that cannot be made as UNREACHABLE', () => {
    const table = minCoinsTable([3, 5], 11);
    expect(table[0]).toBe(0);
    expect(table[3]).toBe(1);
    expect(table[11]).toBe(3); // 3+3+5
    for (const dead of [1, 2, 4, 7]) {
      expect(table[dead]).toBe(UNREACHABLE);
    }
  });
});

describe('knapsack', () => {
  const items: KnapsackItemLike[] = [
    { weight: 1, value: 6 }, // best value-per-weight (the greedy trap)
    { weight: 2, value: 10 },
    { weight: 3, value: 12 },
  ];

  it('matches the Lesson 7 optimum (capacity 5 -> 22, beating greedy-by-ratio 16)', () => {
    expect(knapsackOptimal(items, 5)).toBe(22);
  });

  it('builds a table whose bottom-right cell is the optimum', () => {
    const table = knapsackTable(items, 5);
    expect(table).toHaveLength(items.length + 1);
    expect(table[0]).toEqual([0, 0, 0, 0, 0, 0]); // no items -> no value
    expect(table[items.length][5]).toBe(22);
  });

  it('returns 0 value when nothing fits', () => {
    expect(knapsackOptimal([{ weight: 9, value: 99 }], 5)).toBe(0);
  });
});
