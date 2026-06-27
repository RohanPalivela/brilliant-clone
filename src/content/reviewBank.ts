// The standalone review question bank: extra practice problems that exist only
// for spaced review, not in the linear lessons. This is what keeps daily review
// from recycling the same handful of lesson checkpoints — each DP pattern gets
// a deep pool of fresh variants at growing difficulty.

import type { Slide } from '../types/content';
import {
  buildReachability,
  buildPath,
  buildLookback,
  buildCoinSum,
  buildMinChoice,
} from './reviewBuilders';
import { reachabilityProblems } from './bank/reachability';
import { pathProblems } from './bank/paths';
import { lookbackProblems } from './bank/lookback';
import { coinProblems, minChoiceProblems } from './bank/coins';
import { conceptProblems } from './bank/concepts';

/** Synthetic lesson id under which bank items are keyed for review storage. */
export const REVIEW_BANK_LESSON_ID = 'review-bank';

/** Every standalone review problem, built into fully-gradable slides. */
export const REVIEW_BANK: Slide[] = [
  ...reachabilityProblems.map(buildReachability),
  ...pathProblems.map(buildPath),
  ...lookbackProblems.map(buildLookback),
  ...coinProblems.map(buildCoinSum),
  ...minChoiceProblems.map(buildMinChoice),
  ...conceptProblems,
];
