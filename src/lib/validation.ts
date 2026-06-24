import type { Validation, SlideAnswer } from '../types/content';
import { computeReachable, knapsackOptimal, minCoinsTable, UNREACHABLE } from './dp';

/** Coin values (sorted) whose first-coin choice is optimal for `amount`:
 *  those c where 1 + best[amount − c] equals the best cost for `amount`. */
export function optimalFirstCoins(coins: number[], amount: number): number[] {
  const best = minCoinsTable(coins, amount);
  if (best[amount] === UNREACHABLE) return [];
  return coins
    .filter(
      (c) =>
        amount - c >= 0 &&
        best[amount - c] !== UNREACHABLE &&
        best[amount - c] + 1 === best[amount],
    )
    .sort((a, b) => a - b);
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

/** Pure answer checker. Returns true when the learner's answer is correct. */
export function validateAnswer(
  validation: Validation | undefined,
  answer: SlideAnswer,
): boolean {
  if (!validation || validation.type === 'none') return true;

  switch (validation.type) {
    case 'reachability': {
      if (answer.kind !== 'cells') return false;
      const reachable = computeReachable(validation.steps, validation.jumpSizes);
      if (answer.marks.length !== reachable.length) return false;
      return reachable.every((r, i) => answer.marks[i] === (r ? 'check' : 'cross'));
    }
    case 'multipleChoice': {
      if (answer.kind !== 'choice') return false;
      return sameSet(answer.selectedIds, validation.correctIds);
    }
    case 'range': {
      if (answer.kind !== 'range') return false;
      return sameSet(
        answer.indices.map(String),
        validation.correctIndices.map(String),
      );
    }
    case 'codeBlanks': {
      if (answer.kind !== 'blanks') return false;
      const ids = Object.keys(validation.correct);
      return ids.every((id) => answer.filled[id] === validation.correct[id]);
    }
    case 'knapsack': {
      if (answer.kind !== 'items') return false;
      const chosen = validation.items.filter((it) =>
        answer.selectedIds.includes(it.id),
      );
      const weight = chosen.reduce((sum, it) => sum + it.weight, 0);
      if (weight > validation.capacity) return false;
      const value = chosen.reduce((sum, it) => sum + it.value, 0);
      // Any selection that fits and reaches the optimal value is accepted.
      return value === knapsackOptimal(validation.items, validation.capacity);
    }
    case 'coinSum': {
      if (answer.kind !== 'coins') return false;
      const allowed = new Set(validation.coins);
      if (!answer.picks.every((c) => allowed.has(c))) return false;
      const sum = answer.picks.reduce((s, c) => s + c, 0);
      if (sum !== validation.target) return false;
      if (!validation.fewest) return true;
      const best = minCoinsTable(validation.coins, validation.target);
      return (
        best[validation.target] !== UNREACHABLE &&
        answer.picks.length === best[validation.target]
      );
    }
    case 'jumpPath': {
      if (answer.kind !== 'path') return false;
      const allowed = new Set(validation.jumpSizes);
      if (answer.jumps.length === 0) return false;
      if (!answer.jumps.every((j) => allowed.has(j))) return false;
      const sum = answer.jumps.reduce((s, j) => s + j, 0);
      return sum === validation.target;
    }
    case 'minCoinChoice': {
      if (answer.kind !== 'choice') return false;
      if (answer.selectedIds.length !== 1) return false;
      const optimal = optimalFirstCoins(validation.coins, validation.amount);
      const optimalIds = new Set(optimal.map((c) => `c${c}`));
      return optimalIds.has(answer.selectedIds[0]);
    }
    default:
      return false;
  }
}
