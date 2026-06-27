// Builders that turn small parameter objects into fully-formed, gradable review
// Slides. Correctness is guaranteed by construction: for the "computed-answer"
// patterns (reachability, paths, coins) the validation re-derives the truth from
// the same dp.ts engine the app trusts — so authoring a new problem is just
// choosing good numbers and writing the prose, never hand-entering an answer
// that could drift.

import type { Slide } from '../types/content';

/** Common prose every authored problem supplies. */
interface Prose {
  id: string;
  prompt: string;
  hint: string;
  explanation: string;
  /** Authored difficulty rubric, 1 (trivial) → 5 (hard). Threaded onto the
   *  built Slide so review pools can seed an ascending easy→hard ramp.
   *  Missing defaults to 3 (see DEFAULT_DIFFICULTY). */
  difficulty?: 1 | 2 | 3 | 4 | 5;
}

/** Sensible fallback when a problem omits an explicit difficulty. */
const DEFAULT_DIFFICULTY = 3;

export interface ReachabilityParams extends Prose {
  steps: number;
  jumpSizes: number[];
  /** 'stairs' renders rising steps, 'array' a flat 0/1 row. Default 'stairs'. */
  variant?: 'stairs' | 'array';
}

export interface PathParams extends Prose {
  jumpSizes: number[];
  target: number;
  height?: number;
}

export interface LookbackParams extends Prose {
  steps: number;
  jumpSizes: number[];
  target: number;
  variant?: 'stairs' | 'array';
  name?: string;
  moveLabel?: string;
}

export interface CoinSumParams extends Prose {
  coins: number[];
  target: number;
  fewest?: boolean;
}

export interface MinChoiceParams extends Prose {
  coins: number[];
  amount: number;
}

export function buildReachability(p: ReachabilityParams): Slide {
  const component = p.variant === 'array' ? 'ArrayRow' : 'StairGrid';
  return {
    id: p.id,
    type: 'checkpoint',
    difficulty: p.difficulty ?? DEFAULT_DIFFICULTY,
    component,
    props: {
      steps: p.steps,
      jumpSizes: p.jumpSizes,
      target: p.steps,
      editable: true,
      prompt: p.prompt,
    },
    validation: { type: 'reachability', jumpSizes: p.jumpSizes, steps: p.steps },
    hint: p.hint,
    explanationOnWrong: p.explanation,
  } as Slide;
}

export function buildPath(p: PathParams): Slide {
  return {
    id: p.id,
    type: 'checkpoint',
    difficulty: p.difficulty ?? DEFAULT_DIFFICULTY,
    component: 'PathBuilder',
    props: {
      jumpSizes: p.jumpSizes,
      target: p.target,
      height: p.height ?? p.target,
      prompt: p.prompt,
    },
    validation: { type: 'jumpPath', jumpSizes: p.jumpSizes, target: p.target },
    hint: p.hint,
    explanationOnWrong: p.explanation,
  };
}

export function buildLookback(p: LookbackParams): Slide {
  return {
    id: p.id,
    type: 'checkpoint',
    difficulty: p.difficulty ?? DEFAULT_DIFFICULTY,
    component: 'PredecessorPicker',
    props: {
      steps: p.steps,
      jumpSizes: p.jumpSizes,
      target: p.target,
      variant: p.variant ?? 'array',
      name: p.name,
      moveLabel: p.moveLabel,
      prompt: p.prompt,
    },
    // Answer is the set of predecessors target − j; computed, never hand-entered.
    validation: {
      type: 'range',
      correctIndices: p.jumpSizes
        .map((j) => p.target - j)
        .filter((i) => i >= 0)
        .sort((a, b) => a - b),
    },
    hint: p.hint,
    explanationOnWrong: p.explanation,
  };
}

export function buildCoinSum(p: CoinSumParams): Slide {
  return {
    id: p.id,
    type: 'checkpoint',
    difficulty: p.difficulty ?? DEFAULT_DIFFICULTY,
    component: 'CoinBuilder',
    props: {
      coins: p.coins,
      target: p.target,
      fewest: p.fewest,
      showFewest: p.fewest,
      prompt: p.prompt,
    },
    validation: {
      type: 'coinSum',
      coins: p.coins,
      target: p.target,
      fewest: p.fewest,
    },
    hint: p.hint,
    explanationOnWrong: p.explanation,
  };
}

export function buildMinChoice(p: MinChoiceParams): Slide {
  return {
    id: p.id,
    type: 'checkpoint',
    difficulty: p.difficulty ?? DEFAULT_DIFFICULTY,
    component: 'MinChoicePicker',
    props: { coins: p.coins, amount: p.amount, prompt: p.prompt },
    validation: { type: 'minCoinChoice', coins: p.coins, amount: p.amount },
    hint: p.hint,
    explanationOnWrong: p.explanation,
  };
}
