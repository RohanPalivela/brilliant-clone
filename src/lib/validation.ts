import type { Validation, SlideAnswer } from '../types/content';
import { computeReachable, knapsackOptimal } from './dp';

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
    default:
      return false;
  }
}
