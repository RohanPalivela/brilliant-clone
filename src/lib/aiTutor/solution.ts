import type { Slide, SlideAnswer } from '../../types/content';
import {
  computeReachable,
  lookbackIndices,
  minCoinsTable,
  knapsackOptimal,
  UNREACHABLE,
} from '../dp';
import { optimalFirstCoins } from '../validation';
import type { SlideSolution } from './types';

/**
 * A slide is a graded "activity" (the learner must produce a correct answer to
 * proceed) when it's a prompt/checkpoint with real validation. Mirrors
 * LessonPlayer's `requiresAnswer` so the tutor's notion of "don't give the
 * answer here" lines up exactly with where the app actually gates.
 */
export function isActivitySlide(slide: Slide): boolean {
  return (
    (slide.type === 'prompt' || slide.type === 'checkpoint') &&
    !!slide.validation &&
    slide.validation.type !== 'none'
  );
}

function reachabilitySummary(steps: number, jumpSizes: number[], target?: number): string {
  const reachable = computeReachable(steps, jumpSizes);
  const yes: number[] = [];
  const no: number[] = [];
  reachable.forEach((r, i) => (r ? yes : no).push(i));
  const goal = target ?? steps;
  const looks = lookbackIndices(goal, jumpSizes);
  return (
    `Jumps ${jumpSizes.join(' or ')}, target ${goal}. ` +
    `Reachable (✓): ${yes.join(', ')}. Dead-ends (✗): ${no.join(', ') || 'none'}. ` +
    `Step ${goal} depends on its look-backs ${looks.map((i) => `step ${i}`).join(' and ')}.`
  );
}

/** A valid coin combination for `target` (fewest-coins when requested). */
function coinCombo(coins: number[], target: number, fewest?: boolean): number[] {
  const best = minCoinsTable(coins, target);
  if (best[target] === UNREACHABLE) return [];
  // Reconstruct greedily off the fewest-coins table (works for both modes:
  // following the optimal table always yields a valid exact-sum combination).
  const picks: number[] = [];
  let remaining = target;
  while (remaining > 0) {
    const sorted = [...coins].sort((a, b) => a - b);
    const next = sorted.find(
      (c) => remaining - c >= 0 && best[remaining - c] === best[remaining] - 1,
    );
    if (next === undefined) break;
    picks.push(next);
    remaining -= next;
  }
  // `fewest` is satisfied by construction; the var keeps the signature explicit.
  void fewest;
  return picks;
}

/**
 * Derive the ground-truth answer + coaching reasoning for a slide, reusing the
 * exact same `dp.ts`/validation logic the app trusts so the tutor can never
 * drift from what the app marks correct. Non-activity slides return a concept
 * summary the tutor may explain freely.
 */
export function describeSolution(slide: Slide): SlideSolution {
  const activity = isActivitySlide(slide);
  const v = slide.validation;

  if (!v || v.type === 'none') {
    return {
      isActivity: false,
      answerSummary: 'This slide is explanatory — there is no answer to grade.',
    };
  }

  switch (v.type) {
    case 'reachability':
      return {
        isActivity: activity,
        answerSummary: reachabilitySummary(v.steps, v.jumpSizes, v.target),
        reasoning:
          'A step is ✓ iff at least one of (step − jump) is ✓, for any jump size. Build upward from step 0 (always ✓); never re-trace whole paths.',
      };

    case 'multipleChoice': {
      const opts =
        slide.component === 'MultipleChoice' ? slide.props.options : [];
      const correct = v.correctIds
        .map((id) => opts.find((o) => o.id === id)?.label ?? id)
        .join(' | ');
      return {
        isActivity: activity,
        answerSummary: `Correct option id(s): ${v.correctIds.join(', ')} → "${correct}".`,
        reasoning:
          'Guide the learner to reason about why the right option follows from the look-back rule; do not name the option for them.',
      };
    }

    case 'range':
      return {
        isActivity: activity,
        answerSummary: `Correct selected indices: ${v.correctIndices.join(', ')}.`,
        reasoning:
          'These are the predecessors (target − jump) that decide the target. Coach the subtraction, not the final set.',
      };

    case 'codeBlanks': {
      const pairs = Object.entries(v.correct)
        .map(([id, val]) => `${id}=${val}`)
        .join(', ');
      return {
        isActivity: activity,
        answerSummary: `Correct blank fills: ${pairs}.`,
        reasoning:
          'Each blank mirrors the recurrence already taught. Help the learner map words to code; do not dictate the tokens.',
      };
    }

    case 'knapsack': {
      const best = knapsackOptimal(v.items, v.capacity);
      return {
        isActivity: activity,
        answerSummary: `Optimal value within capacity ${v.capacity} is ${best}.`,
        reasoning:
          'For each item, compare taking vs skipping it under the remaining capacity. Coach the take-vs-skip tradeoff.',
      };
    }

    case 'coinSum': {
      const combo = coinCombo(v.coins, v.target, v.fewest);
      return {
        isActivity: activity,
        answerSummary:
          combo.length > 0
            ? `One valid${v.fewest ? ' fewest-coin' : ''} combination for ${v.target} using ${v.coins.join(', ')}: ${combo.join(' + ')} (${combo.length} coins).`
            : `Target ${v.target} cannot be made from ${v.coins.join(', ')}.`,
        reasoning:
          'Build the amount from a smaller already-solved amount plus one coin. Coach which subproblem to lean on, not the exact coins.',
      };
    }

    case 'jumpPath': {
      const combo = coinCombo(v.jumpSizes, v.target);
      return {
        isActivity: activity,
        answerSummary:
          combo.length > 0
            ? `One path landing exactly on ${v.target} using ${v.jumpSizes.join(', ')}: ${combo.join(' + ')}.`
            : `Step ${v.target} is unreachable with jumps ${v.jumpSizes.join(', ')}.`,
        reasoning:
          'The jumps must sum exactly to the target; overshooting is illegal. Coach stacking jump sizes, not the exact sequence.',
      };
    }

    case 'minCoinChoice': {
      const firsts = optimalFirstCoins(v.coins, v.amount);
      return {
        isActivity: activity,
        answerSummary: `Optimal first coin(s) for amount ${v.amount}: ${firsts.join(', ') || 'none'}.`,
        reasoning:
          'Compare 1 + best[amount − coin] across coins and pick the smallest. Coach the comparison.',
      };
    }

    default:
      return {
        isActivity: activity,
        answerSummary: 'Answer is graded by the app.',
      };
  }
}

/** Map a chosen option id to a learner-friendly label, falling back to the id. */
function choiceLabel(id: string, slide?: Slide): string {
  if (slide?.component === 'MultipleChoice') {
    const opt = slide.props.options.find((o) => o.id === id);
    if (opt) return `"${opt.label}" (id: ${id})`;
  }
  // MinChoicePicker encodes the chosen coin as option id "c<coin>".
  if (slide?.component === 'MinChoicePicker' && /^c\d+$/.test(id)) {
    return `coin ${id.slice(1)} (id: ${id})`;
  }
  return id;
}

/** Map a picked item id to its label (knapsack), falling back to the id. */
function itemLabel(id: string, slide?: Slide): string {
  if (slide?.component === 'KnapsackPicker') {
    const it = slide.props.items.find((i) => i.id === id);
    if (it) return `"${it.label}" (id: ${id})`;
  }
  return id;
}

/**
 * Human-readable description of what the learner has currently entered. When the
 * slide is provided, option/item ids are resolved to their on-screen labels so
 * the tutor can repeat the learner's own choice back to them in plain language.
 */
export function describeAnswer(answer: SlideAnswer, slide?: Slide): string {
  switch (answer.kind) {
    case 'cells': {
      const marked = answer.marks
        .map((m, i) => (m === 'empty' ? null : `${i}:${m === 'check' ? '✓' : '✗'}`))
        .filter(Boolean);
      return marked.length
        ? `Cells marked so far — ${marked.join(', ')}.`
        : 'No cells marked yet.';
    }
    case 'choice':
      return answer.selectedIds.length
        ? `Selected option(s): ${answer.selectedIds.map((id) => choiceLabel(id, slide)).join(', ')}.`
        : 'No option selected yet.';
    case 'range':
      return answer.indices.length
        ? `Selected indices: ${answer.indices.join(', ')}.`
        : 'No indices selected yet.';
    case 'blanks': {
      const filled = Object.entries(answer.filled)
        .map(([id, val]) => `${id}=${val}`)
        .join(', ');
      return filled ? `Blanks filled: ${filled}.` : 'No blanks filled yet.';
    }
    case 'items':
      return answer.selectedIds.length
        ? `Items picked: ${answer.selectedIds.map((id) => itemLabel(id, slide)).join(', ')}.`
        : 'No items picked yet.';
    case 'coins':
      return answer.picks.length
        ? `Coins placed: ${answer.picks.join(', ')}.`
        : 'No coins placed yet.';
    case 'path':
      return answer.jumps.length
        ? `Jumps taken: ${answer.jumps.join(', ')}.`
        : 'No jumps taken yet.';
    case 'none':
    default:
      return 'No input on this slide.';
  }
}
