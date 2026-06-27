// End-to-end proof that every candidate is drop-in compatible AND correct:
// we run each param object through the REAL builders (reviewBuilders.ts) and
// confirm the REAL grader (validateAnswer in validation.ts) accepts the
// engine-derived correct answer. If a number were wrong, the build or the grade
// would fail here.
//
//   npx vitest run --config scratch/vitest.config.ts
import { describe, it, expect } from 'vitest';
import {
  buildReachability,
  buildPath,
  buildLookback,
  buildCoinSum,
  buildMinChoice,
} from '../src/content/reviewBuilders';
import { validateAnswer, optimalFirstCoins } from '../src/lib/validation';
import { computeReachable, lookbackIndices, minCoinsTable, UNREACHABLE } from '../src/lib/dp';
import type { Validation, SlideAnswer } from '../src/types/content';
import {
  reachabilityCandidates,
  pathCandidates,
  lookbackCandidates,
  coinSumCandidates,
  minChoiceCandidates,
  conceptCandidates,
} from './candidate-problems';

/** Any exact non-negative combination of jumps summing to target. */
function exactCombo(jumps: number[], target: number): number[] | null {
  const reach = new Array<number | null>(target + 1).fill(null);
  reach[0] = -1;
  for (let a = 1; a <= target; a++) {
    for (const j of jumps) {
      if (a - j >= 0 && reach[a - j] !== null) {
        reach[a] = j;
        break;
      }
    }
  }
  if (reach[target] === null) return null;
  const out: number[] = [];
  let rem = target;
  while (rem > 0) {
    const j = reach[rem]!;
    out.push(j);
    rem -= j;
  }
  return out;
}

/** Fewest-coins optimal pick multiset for `target`. */
function optimalPicks(coins: number[], target: number): number[] {
  const best = minCoinsTable(coins, target);
  const out: number[] = [];
  let rem = target;
  while (rem > 0) {
    const c = coins.find(
      (x) => rem - x >= 0 && best[rem - x] !== UNREACHABLE && best[rem - x] + 1 === best[rem],
    )!;
    out.push(c);
    rem -= c;
  }
  return out;
}

function v(slide: { validation?: Validation }): Validation {
  expect(slide.validation).toBeDefined();
  return slide.validation!;
}

describe('reachability candidates', () => {
  it.each(reachabilityCandidates.map((p) => [p.id, p] as const))(
    '%s grades the computed reachable set as correct',
    (_id, p) => {
      const slide = buildReachability(p);
      const reachable = computeReachable(p.steps, p.jumpSizes);
      const answer: SlideAnswer = {
        kind: 'cells',
        marks: reachable.map((r) => (r ? 'check' : 'cross')),
      };
      expect(validateAnswer(v(slide), answer)).toBe(true);
    },
  );
});

describe('path candidates', () => {
  it.each(pathCandidates.map((p) => [p.id, p] as const))(
    '%s is reachable and grades an exact combo as correct',
    (_id, p) => {
      const slide = buildPath(p);
      const combo = exactCombo(p.jumpSizes, p.target);
      expect(combo, `${p.id} target must be reachable`).not.toBeNull();
      const answer: SlideAnswer = { kind: 'path', jumps: combo! };
      expect(validateAnswer(v(slide), answer)).toBe(true);
    },
  );
});

describe('lookback candidates', () => {
  it.each(lookbackCandidates.map((p) => [p.id, p] as const))(
    '%s grades the predecessor set {target - j} as correct',
    (_id, p) => {
      const slide = buildLookback(p);
      const answer: SlideAnswer = {
        kind: 'range',
        indices: lookbackIndices(p.target, p.jumpSizes),
      };
      expect(validateAnswer(v(slide), answer)).toBe(true);
    },
  );
});

describe('coinSum candidates', () => {
  it.each(coinSumCandidates.map((p) => [p.id, p] as const))(
    '%s is reachable and grades correctly (fewest where required)',
    (_id, p) => {
      const slide = buildCoinSum(p);
      const best = minCoinsTable(p.coins, p.target);
      expect(best[p.target], `${p.id} must be reachable`).not.toBe(UNREACHABLE);
      const picks = p.fewest ? optimalPicks(p.coins, p.target) : exactCombo(p.coins, p.target)!;
      const answer: SlideAnswer = { kind: 'coins', picks };
      expect(validateAnswer(v(slide), answer)).toBe(true);
    },
  );
});

describe('minChoice candidates (verified unique greedy traps)', () => {
  it.each(minChoiceCandidates.map((p) => [p.id, p] as const))(
    '%s has a UNIQUE optimal first coin and grades it correct',
    (_id, p) => {
      const slide = buildMinChoice(p);
      const optimal = optimalFirstCoins(p.coins, p.amount);
      expect(optimal.length, `${p.id} optimal first coin must be unique`).toBe(1);
      const answer: SlideAnswer = { kind: 'choice', selectedIds: [`c${optimal[0]}`] };
      expect(validateAnswer(v(slide), answer)).toBe(true);
    },
  );
});

describe('concept candidates (CodeBlanks + MCQ)', () => {
  it.each(conceptCandidates.map((s) => [s.id, s] as const))(
    '%s grades its author-specified answer correct and obeys one-token-per-blank',
    (_id, slide) => {
      const val = v(slide);
      if (val.type === 'codeBlanks') {
        // One token id per blank: no token id reused across blanks in a slide.
        const ids = Object.values(val.correct);
        expect(new Set(ids).size).toBe(ids.length);
        const answer: SlideAnswer = { kind: 'blanks', filled: { ...val.correct } };
        expect(validateAnswer(val, answer)).toBe(true);
      } else if (val.type === 'multipleChoice') {
        const answer: SlideAnswer = { kind: 'choice', selectedIds: [...val.correctIds] };
        expect(validateAnswer(val, answer)).toBe(true);
      } else {
        throw new Error(`unexpected concept validation type: ${val.type}`);
      }
    },
  );
});
