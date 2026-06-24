import { describe, it, expect } from 'vitest';
import { validateAnswer } from './validation';
import { computeReachable } from './dp';
import type { Validation, SlideAnswer, CellMark } from '../types/content';

function cellsFromReachable(steps: number, jumps: number[]): CellMark[] {
  return computeReachable(steps, jumps).map((r) => (r ? 'check' : 'cross'));
}

describe('validateAnswer — none / undefined', () => {
  it('treats undefined validation as always correct', () => {
    expect(validateAnswer(undefined, { kind: 'none' })).toBe(true);
  });

  it("treats { type: 'none' } as always correct", () => {
    expect(validateAnswer({ type: 'none' }, { kind: 'none' })).toBe(true);
  });
});

describe('validateAnswer — reachability', () => {
  const validation: Validation = {
    type: 'reachability',
    jumpSizes: [3, 5],
    steps: 11,
  };

  it('accepts the correct reachability map', () => {
    const answer: SlideAnswer = {
      kind: 'cells',
      marks: cellsFromReachable(11, [3, 5]),
    };
    expect(validateAnswer(validation, answer)).toBe(true);
  });

  it('rejects a map with a single wrong cell', () => {
    const marks = cellsFromReachable(11, [3, 5]);
    marks[7] = 'check'; // step 7 is actually unreachable
    expect(validateAnswer(validation, { kind: 'cells', marks })).toBe(false);
  });

  it('rejects an unmarked (empty) cell even if the rest is right', () => {
    const marks = cellsFromReachable(11, [3, 5]);
    marks[4] = 'empty';
    expect(validateAnswer(validation, { kind: 'cells', marks })).toBe(false);
  });

  it('rejects a map of the wrong length', () => {
    expect(
      validateAnswer(validation, { kind: 'cells', marks: ['check', 'cross'] }),
    ).toBe(false);
  });

  it('rejects an answer of the wrong kind', () => {
    expect(validateAnswer(validation, { kind: 'choice', selectedIds: [] })).toBe(
      false,
    );
  });
});

describe('validateAnswer — multipleChoice', () => {
  const single: Validation = { type: 'multipleChoice', correctIds: ['no'] };
  const multi: Validation = {
    type: 'multipleChoice',
    correctIds: ['reach', 'fib', 'coins'],
  };

  it('accepts the exact single selection', () => {
    expect(validateAnswer(single, { kind: 'choice', selectedIds: ['no'] })).toBe(
      true,
    );
  });

  it('rejects a wrong single selection', () => {
    expect(
      validateAnswer(single, { kind: 'choice', selectedIds: ['reach'] }),
    ).toBe(false);
  });

  it('accepts a multi-select set regardless of order', () => {
    expect(
      validateAnswer(multi, {
        kind: 'choice',
        selectedIds: ['coins', 'reach', 'fib'],
      }),
    ).toBe(true);
  });

  it('rejects a multi-select that is missing one correct id', () => {
    expect(
      validateAnswer(multi, { kind: 'choice', selectedIds: ['reach', 'fib'] }),
    ).toBe(false);
  });

  it('rejects a multi-select that includes an extra wrong id', () => {
    expect(
      validateAnswer(multi, {
        kind: 'choice',
        selectedIds: ['reach', 'fib', 'coins', 'max'],
      }),
    ).toBe(false);
  });
});

describe('validateAnswer — range', () => {
  const validation: Validation = { type: 'range', correctIndices: [3, 4, 5] };

  it('accepts the correct window in any order', () => {
    expect(validateAnswer(validation, { kind: 'range', indices: [5, 3, 4] })).toBe(
      true,
    );
  });

  it('rejects a window that is too wide', () => {
    expect(
      validateAnswer(validation, { kind: 'range', indices: [3, 4, 5, 6] }),
    ).toBe(false);
  });

  it('rejects a shifted window', () => {
    expect(validateAnswer(validation, { kind: 'range', indices: [4, 5, 6] })).toBe(
      false,
    );
  });
});

describe('validateAnswer — codeBlanks', () => {
  const validation: Validation = {
    type: 'codeBlanks',
    correct: { ground: 'zero', lookback: 'iminusj', current: 'i' },
  };

  it('accepts all blanks filled correctly', () => {
    expect(
      validateAnswer(validation, {
        kind: 'blanks',
        filled: { ground: 'zero', lookback: 'iminusj', current: 'i' },
      }),
    ).toBe(true);
  });

  it('rejects a single wrong blank', () => {
    expect(
      validateAnswer(validation, {
        kind: 'blanks',
        filled: { ground: 'zero', lookback: 'iplusj', current: 'i' },
      }),
    ).toBe(false);
  });

  it('rejects a missing blank', () => {
    expect(
      validateAnswer(validation, {
        kind: 'blanks',
        filled: { ground: 'zero', current: 'i' },
      }),
    ).toBe(false);
  });
});

describe('validateAnswer — knapsack', () => {
  const items = [
    { id: 'emerald', label: 'Emerald', weight: 1, value: 6 },
    { id: 'goblet', label: 'Goblet', weight: 2, value: 10 },
    { id: 'crown', label: 'Crown', weight: 3, value: 12 },
  ];
  const validation: Validation = { type: 'knapsack', capacity: 5, items };

  it('accepts a selection that fits and reaches the optimal value', () => {
    expect(
      validateAnswer(validation, {
        kind: 'items',
        selectedIds: ['goblet', 'crown'], // weight 5, value 22 = optimum
      }),
    ).toBe(true);
  });

  it('rejects the greedy-by-ratio pick that is under optimal', () => {
    expect(
      validateAnswer(validation, {
        kind: 'items',
        selectedIds: ['emerald', 'goblet'], // weight 3, value 16 < 22
      }),
    ).toBe(false);
  });

  it('rejects a selection that exceeds capacity', () => {
    expect(
      validateAnswer(validation, {
        kind: 'items',
        selectedIds: ['emerald', 'goblet', 'crown'], // weight 6 > 5
      }),
    ).toBe(false);
  });

  it('rejects an answer of the wrong kind', () => {
    expect(validateAnswer(validation, { kind: 'none' })).toBe(false);
  });
});

describe('validateAnswer — coinSum', () => {
  const feasible: Validation = { type: 'coinSum', coins: [3, 5], target: 11 };
  const fewest: Validation = {
    type: 'coinSum',
    coins: [1, 3, 4],
    target: 6,
    fewest: true,
  };

  it('accepts any exact build in plain mode', () => {
    expect(
      validateAnswer(feasible, { kind: 'coins', picks: [3, 3, 5] }),
    ).toBe(true);
  });

  it('rejects an overshoot', () => {
    expect(validateAnswer(feasible, { kind: 'coins', picks: [5, 5, 5] })).toBe(
      false,
    );
  });

  it('rejects a coin that is not in the set', () => {
    expect(validateAnswer(feasible, { kind: 'coins', picks: [4, 7] })).toBe(false);
  });

  it('accepts only the fewest-coin build in fewest mode', () => {
    expect(validateAnswer(fewest, { kind: 'coins', picks: [3, 3] })).toBe(true);
    // 4 + 1 + 1 hits 6 but uses 3 coins, not the minimum 2.
    expect(validateAnswer(fewest, { kind: 'coins', picks: [4, 1, 1] })).toBe(
      false,
    );
  });

  it('rejects an answer of the wrong kind', () => {
    expect(validateAnswer(feasible, { kind: 'none' })).toBe(false);
  });
});

describe('validateAnswer — jumpPath', () => {
  const validation: Validation = { type: 'jumpPath', jumpSizes: [3, 7], target: 13 };

  it('accepts a sequence that lands exactly on the target', () => {
    expect(validateAnswer(validation, { kind: 'path', jumps: [3, 3, 7] })).toBe(
      true,
    );
    expect(validateAnswer(validation, { kind: 'path', jumps: [7, 3, 3] })).toBe(
      true,
    );
  });

  it('rejects a sequence that misses the target', () => {
    expect(validateAnswer(validation, { kind: 'path', jumps: [3, 3, 3] })).toBe(
      false,
    );
  });

  it('rejects an empty path', () => {
    expect(validateAnswer(validation, { kind: 'path', jumps: [] })).toBe(false);
  });

  it('rejects a jump that is not in the set', () => {
    expect(validateAnswer(validation, { kind: 'path', jumps: [13] })).toBe(false);
  });
});

describe('validateAnswer — minCoinChoice', () => {
  // Coins {1,3,4}, amount 6: laying a 3 is the unique cheapest first move.
  const validation: Validation = {
    type: 'minCoinChoice',
    coins: [1, 3, 4],
    amount: 6,
  };

  it('accepts the optimal first coin', () => {
    expect(validateAnswer(validation, { kind: 'choice', selectedIds: ['c3'] })).toBe(
      true,
    );
  });

  it('rejects a suboptimal first coin', () => {
    expect(validateAnswer(validation, { kind: 'choice', selectedIds: ['c4'] })).toBe(
      false,
    );
    expect(validateAnswer(validation, { kind: 'choice', selectedIds: ['c1'] })).toBe(
      false,
    );
  });

  it('rejects more than one selection', () => {
    expect(
      validateAnswer(validation, { kind: 'choice', selectedIds: ['c3', 'c1'] }),
    ).toBe(false);
  });
});
