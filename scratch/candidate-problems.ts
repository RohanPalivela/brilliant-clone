// ---------------------------------------------------------------------------
// CANDIDATE review problems for the DP course — drop-in compatible with the
// existing authoring system (src/content/reviewBuilders.ts + src/content/bank/*).
//
// Every number here was generated and then re-derived from the SAME engine the
// app grades with (src/lib/dp.ts + src/lib/validation.ts) via scratch/discover.mjs,
// so reachable sets, exact path multisets, min-coin optima, greedy-largest counts,
// and optimal-first-coin uniqueness are all engine-true, not hand-asserted.
//
// Scope is strictly within the lessons (1D staircase reachability, path-building,
// look-back dependencies, recurrence-in-code, coin-change feasibility/count/fewest,
// optimal first choice). NO knapsack / 2D DP.
//
// ids are prefixed `cand-` so they never collide with the shipped `rb-` bank.
// Difficulty (1–5) + the concept each reinforces are documented per-problem in
// scratch/candidate-problems.md and summarized in inline comments below.
// ---------------------------------------------------------------------------

import type {
  ReachabilityParams,
  PathParams,
  LookbackParams,
  CoinSumParams,
  MinChoiceParams,
} from '../src/content/reviewBuilders';
import type { Slide } from '../src/types/content';

// ===========================================================================
// 1) REACHABILITY SWEEPS  (skill: reachability-sweep)
//    reachable[0]=true; reachable[i] = OR over jumps j of reachable[i-j].
// ===========================================================================
export const reachabilityCandidates: ReachabilityParams[] = [
  {
    // diff 1 — every cell reachable; teaches base case + "i-1 is always there".
    id: 'cand-reach-1-2-stairs',
    steps: 7,
    jumpSizes: [1, 2],
    variant: 'stairs',
    prompt:
      'You start on the ground (step 0) of a 7-step staircase and may climb 1 or 2 steps at a time. Mark every step you can land on.',
    hint: 'Step 0 is free. With a 1-step available, step i is reachable whenever step i-1 is — so sweep up and watch the whole staircase light up.',
    explanation:
      'With a 1-jump, every step i has the reachable predecessor i-1, so all of 0,1,2,3,4,5,6,7 are reachable. This is the easy baseline: the moment your jump set contains 1, nothing is ever stranded.',
  },
  {
    // diff 2 — single early gap at 1.
    id: 'cand-reach-2-3-array',
    steps: 9,
    jumpSizes: [2, 3],
    variant: 'array',
    prompt:
      'A frog sits on pad 0 in a row numbered 0–9 and hops exactly 2 or 3 pads forward. Tick every pad it can reach.',
    hint: 'Pad i is reachable when pad i-2 or pad i-3 is. Only the very first pad has no valid predecessor.',
    explanation:
      'Reachable pads are 0, 2, 3, 4, 5, 6, 7, 8, 9 — only pad 1 is stranded (1-2 and 1-3 are both below the start). Once you clear 1, every pad has a reachable look-back, so the board fills in completely.',
  },
  {
    // diff 2 — gaps {1,2,5}, last gap is 5.
    id: 'cand-reach-3-4-stairs',
    steps: 13,
    jumpSizes: [3, 4],
    variant: 'stairs',
    prompt:
      'On a 13-step staircase you can bound up 3 or 4 steps at a time from step 0. Mark every reachable step.',
    hint: 'Step i is reachable if step i-3 or step i-4 is. The gaps are small but one hides at step 5 — check it carefully.',
    explanation:
      'Reachable steps are 0, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13. The gaps are 1, 2, and 5: step 5 fails because 5-3=2 and 5-4=1 are both unreachable. From step 6 onward every step has a reachable predecessor.',
  },
  {
    // diff 3 — gaps {1,2,4,7}; 7 is a deceptive middle gap.
    id: 'cand-reach-3-5-array',
    steps: 14,
    jumpSizes: [3, 5],
    variant: 'array',
    prompt:
      'A robot starts at cell 0 of a 0–14 number line and advances by 3 or 5 each move. Highlight every cell it can occupy.',
    hint: 'Cell i is reachable when cell i-3 or cell i-5 is. Watch cell 7 — it sits between reachable cells but may still be stuck.',
    explanation:
      'Reachable cells are 0, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14. The gaps are 1, 2, 4, and 7. Cell 7 is the trap: 7-3=4 and 7-5=2 are both unreachable, so 7 is stranded even though 6 and 8 are fine. After 7 the board fills in.',
  },
  {
    // diff 3 — gaps {1,3,5}; odd small cells stuck, then all reachable.
    id: 'cand-reach-2-7-stairs',
    steps: 16,
    jumpSizes: [2, 7],
    variant: 'stairs',
    prompt:
      'A 16-step staircase lets you climb 2 or 7 steps at once from step 0. Mark every step you can reach.',
    hint: 'Even steps come easily from repeated 2s; the odd steps only become reachable once a 7 lands you on one. Find the first reachable odd step.',
    explanation:
      'Reachable steps are 0, 2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16. The gaps are 1, 3, and 5 — every odd step below 7 is stuck because the only way to reach an odd total is to use the single 7-jump, and 7 is the first odd step you can hit. From 7 up, evens and odds are both reachable.',
  },
  {
    // diff 4 — Frobenius(5,8)=27; scattered gaps, 19 is the last gap.
    id: 'cand-reach-5-8-array',
    steps: 20,
    jumpSizes: [5, 8],
    variant: 'array',
    prompt:
      'Cells 0–20 sit in a row. From cell 0 you may advance by 5 or 8 cells per move. Mark every cell that can be landed on.',
    hint: 'Cell i is reachable when cell i-5 or cell i-8 is. With only 5 and 8 the gaps run deep — do not assume the upper cells are all reachable.',
    explanation:
      'Reachable cells are 0, 5, 8, 10, 13, 15, 16, 18, 20. The gaps are 1, 2, 3, 4, 6, 7, 9, 11, 12, 14, 17, and 19. The dangerous ones are high: 17 (17-5=12, 17-8=9 both unreachable) and 19 — the very LAST gap (19-5=14, 19-8=11 both unreachable). You must run the full sweep.',
  },
  {
    // diff 4 — gaps include 19 as last; mixed parity from {4,9}.
    id: 'cand-reach-4-9-stairs',
    steps: 22,
    jumpSizes: [4, 9],
    variant: 'stairs',
    prompt:
      'A climber on a 22-rung wall starts at rung 0 and pulls up 4 or 9 rungs each time. Mark every rung the climber can land on.',
    hint: 'Rung i is reachable when rung i-4 or rung i-9 is. The 9-jump flips parity, so both even and odd rungs eventually appear — but several stay stranded surprisingly high.',
    explanation:
      'Reachable rungs are 0, 4, 8, 9, 12, 13, 16, 17, 18, 20, 21, 22. The gaps are 1, 2, 3, 5, 6, 7, 10, 11, 14, 15, and 19. Note 14 and 15 are stranded mid-board, and 19 is the final gap (19-4=15, 19-9=10 both unreachable). From 20 up everything is reachable.',
  },
  {
    // diff 5 — gcd(6,10)=2 but the odd 15 breaks parity; 23 is a near-top gap.
    id: 'cand-reach-6-10-15-array',
    steps: 24,
    jumpSizes: [6, 10, 15],
    variant: 'array',
    prompt:
      'A drone hops along cells 0–24, moving forward by 6, 10, or 15 each turn from cell 0. Highlight every cell it can occupy.',
    hint: 'Two jumps (6, 10) are even and one (15) is odd, so odd cells only appear after a 15 is used. Three look-backs per cell — test i-6, i-10, and i-15.',
    explanation:
      'Reachable cells are 0, 6, 10, 12, 15, 16, 18, 20, 21, 22, 24. The gaps include 1–5, 7–9, 11, 13, 14, 17, 19, and 23. Odd cells stay unreachable until 15 unlocks them (15, 21, …). Watch 23: 23-6=17, 23-10=13, 23-15=8 are all unreachable, so even this near-top cell is stranded.',
  },
  {
    // diff 2 — only gap is 1; with {2,3} everything from 2 up is reachable.
    id: 'cand-reach-2-3-7-array',
    steps: 12,
    jumpSizes: [2, 3, 7],
    variant: 'array',
    prompt:
      'A grasshopper starts on pad 0 (pads 0–12) and may jump 2, 3, or 7 pads forward. Tick every pad it can reach.',
    hint: 'Three jumps to check per pad. With both a 2 and a 3 available, ask which single pad has no reachable predecessor at all.',
    explanation:
      'Reachable pads are 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 — only pad 1 is stranded. Because 2 and 3 are consecutive, every total of 2 or more is reachable; the extra 7-jump changes nothing here. A nice contrast to the sparse boards: more jumps does not mean more gaps.',
  },
  {
    // diff 5 — Frobenius(7,11)=59 >> 26, so gaps dominate AND the top step 26 is unreachable.
    id: 'cand-reach-7-11-stairs',
    steps: 26,
    jumpSizes: [7, 11],
    variant: 'stairs',
    prompt:
      'A 26-step staircase only allows leaps of 7 or 11 from step 0. Mark every step you can possibly land on.',
    hint: 'Step i is reachable when step i-7 or step i-11 is. These jumps are large and coprime, so reachable steps are RARE — and do not assume the top step is reachable.',
    explanation:
      'Reachable steps are only 0, 7, 11, 14, 18, 21, 22, and 25. Everything else is a gap. The headline twist: even the top step 26 is UNREACHABLE (26-7=19 and 26-11=15 are both unreachable), so the staircase cannot be finished. With large coprime jumps the reachable set stays sparse far past the bottom.',
  },
];

// ===========================================================================
// 2) PATH BUILDING  (skill: path-building)
//    Pick jumps that sum EXACTLY to target. Each target below is reachable as a
//    unique multiset of jumps (engine-confirmed exactMultisets === 1).
// ===========================================================================
export const pathCandidates: PathParams[] = [
  {
    // diff 1 — greedy 5+2+2 also works; gentle warm-up. unique: 2+2+5.
    id: 'cand-path-2-5-to-9',
    jumpSizes: [2, 5],
    target: 9,
    prompt:
      'A frog crosses to lily pad 9 from pad 0, hopping only 2 or 5 pads at a time. Land exactly on pad 9.',
    hint: 'One big 5-hop leaves 4 — which is just two 2-hops. There is only one mix that works.',
    explanation:
      'The only exact combination is 5 + 2 + 2 = 9 (one 5 and two 2s). Here even grabbing the 5 first finishes cleanly, so this is a confidence-builder before the greedy traps.',
  },
  {
    // diff 3 — greedy 4+4=8 strands. unique: 3+3+4.
    id: 'cand-path-3-4-to-10',
    jumpSizes: [3, 4],
    target: 10,
    prompt:
      'Climb to step 10 from the ground using only 3-step and 4-step strides. Your strides must total exactly 10.',
    hint: 'Two 4s put you on 8, where a 3 overshoots to 11 and a 4 to 12. Lean on the 3s instead.',
    explanation:
      'Greedy 4 + 4 = 8 dead-ends (both jumps overshoot 10 from there). The unique exact mix is 3 + 3 + 4 = 10 — two 3s and one 4.',
  },
  {
    // diff 2 — greedy 7+2+2 works. unique: 2+2+7.
    id: 'cand-path-2-7-to-11',
    jumpSizes: [2, 7],
    target: 11,
    prompt:
      'A robot must stop exactly on cell 11, starting at cell 0 and rolling forward by 2 or 7 each move. Pick moves that sum to 11.',
    hint: 'Use the big 7 once, then the remaining 4 splits into two 2s.',
    explanation:
      'The only exact route is 7 + 2 + 2 = 11. Since 11 is odd, you must use exactly one 7 (an odd jump) and fill the rest with 2s. A nice parity-reasoning warm-up.',
  },
  {
    // diff 4 — greedy 5*4=20 strands; longer, two coin types. unique: 4+4+4+5+5.
    id: 'cand-path-4-5-to-22',
    jumpSizes: [4, 5],
    target: 22,
    prompt:
      'On a number line you may step forward by 4 or 5 at a time. Assemble a sequence that stops precisely on cell 22.',
    hint: 'Four 5s march you to 20, where both a 4 and a 5 overshoot 22. Balance the 4s and 5s instead.',
    explanation:
      'Greedy 5 + 5 + 5 + 5 = 20 strands you (4→24, 5→25). The unique exact mix is 4 + 4 + 4 + 5 + 5 = 22 — three 4s and two 5s.',
  },
  {
    // diff 3 — greedy 5+5+3=13 strands. unique: 3+3+3+5.
    id: 'cand-path-3-5-to-14',
    jumpSizes: [3, 5],
    target: 14,
    prompt:
      'A hiker ascends to ledge 14 from ledge 0 using only 3-step and 5-step jumps. Choose jumps that total exactly 14.',
    hint: 'Two 5s and a 3 reach 13, then both jumps overshoot. Use a single 5 and pile on 3s.',
    explanation:
      'Greedy 5 + 5 + 3 = 13 is a dead end (3→16, 5→18 both overshoot 14). The unique exact path is 3 + 3 + 3 + 5 = 14 — three 3s and one 5.',
  },
  {
    // diff 4 — avoid the big jump entirely; greedy 7+7+7=21 strands. unique: 6+6+6+6.
    id: 'cand-path-6-7-to-24',
    jumpSizes: [6, 7],
    target: 24,
    prompt:
      'A climber scales to hold 24 from hold 0, reaching only 6 or 7 holds higher per pull. Land exactly on hold 24.',
    hint: 'The 7-pull is poison here — once you take three, nothing finishes. What if you never use the 7 at all?',
    explanation:
      'Greedy 7 + 7 + 7 = 21 dead-ends (6→27, 7→28). The only exact path ignores the 7 entirely: 6 + 6 + 6 + 6 = 24. Sometimes the bigger jump is never part of a valid solution.',
  },
  {
    // diff 5 — greedy 8+8+8=24 strands; two pairs needed. unique: 5+5+8+8.
    id: 'cand-path-5-8-to-26',
    jumpSizes: [5, 8],
    target: 26,
    prompt:
      'A delivery bot must halt exactly on cell 26, advancing by 5 or 8 from cell 0. Pick moves that sum to 26.',
    hint: 'Three 8s reach 24 and strand you (5→29, 8→32). You need TWO of each jump — find the balance.',
    explanation:
      'Greedy 8 + 8 + 8 = 24 dead-ends. The unique exact mix is 5 + 5 + 8 + 8 = 26 — two 5s and two 8s. Requiring a balanced pair of each jump makes the backward reasoning harder.',
  },
  {
    // diff 4 — greedy 7+7+7=21 strands. unique: 4+4+7+7.
    id: 'cand-path-4-7-to-22',
    jumpSizes: [4, 7],
    target: 22,
    prompt:
      'A kangaroo bounds to marker 22 from marker 0, covering 4 or 7 units each bound. Land exactly on 22.',
    hint: 'Three 7s overshoot via 21→ dead end. Trade one 7 for a pair of 4s and keep two 7s.',
    explanation:
      'Greedy 7 + 7 + 7 = 21 strands you (4→25, 7→28). The unique exact path is 4 + 4 + 7 + 7 = 22 — two 4s and two 7s.',
  },
  {
    // diff 5 — greedy 8+8+8=24 strands; long tail of 3s. unique: 3+3+3+8+8.
    id: 'cand-path-3-8-to-25',
    jumpSizes: [3, 8],
    target: 25,
    prompt:
      'A robot must stop exactly on cell 25, advancing by 3 or 8 from cell 0. Find moves that sum to 25.',
    hint: 'Three 8s reach 24 and strand you. Use exactly two 8s, then fill the remaining 9 with 3s.',
    explanation:
      'Greedy 8 + 8 + 8 = 24 dead-ends (3→27, 8→32). The unique exact mix is 3 + 3 + 3 + 8 + 8 = 25 — three 3s and two 8s.',
  },
  {
    // diff 3 — greedy 5+5+2=12 strands; long tail of 2s. unique: 2+2+2+2+5.
    id: 'cand-path-2-5-to-13',
    jumpSizes: [2, 5],
    target: 13,
    prompt:
      'A frog leaps to lily pad 13 from pad 0, hopping 2 or 5 pads each time. Land exactly on pad 13.',
    hint: 'Two 5s and a 2 reach 12, then both hops overshoot. Use a single 5 and the rest 2s.',
    explanation:
      'Greedy 5 + 5 + 2 = 12 strands you (2→14, 5→17). The unique exact path is 2 + 2 + 2 + 2 + 5 = 13 — four 2s and one 5 (you must use exactly one odd 5-jump to hit the odd target).',
  },
];

// ===========================================================================
// 3) LOOK-BACK DEPENDENCIES  (skill: lookback)
//    Correct predecessors = {target - j} for each jump j with target - j >= 0.
//    `steps` sits above target so forward decoys exist; jumps > target filter out.
// ===========================================================================
export const lookbackCandidates: LookbackParams[] = [
  {
    // diff 1 — preds {5,6,7}, clustered, consecutive jumps.
    id: 'cand-look-1-2-3-at-8',
    steps: 12,
    jumpSizes: [1, 2, 3],
    target: 8,
    variant: 'array',
    moveLabel: 'cell',
    name: 'Ada',
    prompt:
      'Ada moves forward by 1, 2, or 3 cells. To decide whether cell 8 is reachable, which earlier cells must she already know about?',
    hint: 'Subtract each move from 8. Three consecutive jumps give three neighbours just below 8.',
    explanation:
      'Cell 8 depends on cells 8-1=7, 8-2=6, and 8-3=5, so the deciding cells are 5, 6, and 7. Cells 9–12 are ahead of 8 and never feed into it.',
  },
  {
    // diff 2 — preds {4,6,8}, all even.
    id: 'cand-look-2-4-6-at-10',
    steps: 14,
    jumpSizes: [2, 4, 6],
    target: 10,
    variant: 'stairs',
    moveLabel: 'step',
    name: 'Pip the frog',
    prompt:
      'Pip the frog hops 2, 4, or 6 steps. Select the earlier steps that determine whether step 10 can be reached.',
    hint: 'The look-backs are 10 minus each hop. All three hops are even, so the predecessors are too.',
    explanation:
      'Step 10 depends on steps 10-2=8, 10-4=6, and 10-6=4, so the deciding steps are 4, 6, and 8. Steps 11–14 are above 10 and irrelevant, and an odd step like 5 or 7 is not exactly one hop below 10.',
  },
  {
    // diff 3 — preds {6,9,11}, spread out.
    id: 'cand-look-3-5-8-at-14',
    steps: 18,
    jumpSizes: [3, 5, 8],
    target: 14,
    variant: 'array',
    moveLabel: 'cell',
    name: 'Robot R-14',
    prompt:
      'Robot R-14 moves forward by 3, 5, or 8 cells. Which earlier cells decide whether cell 14 is reachable?',
    hint: 'Look back 3, 5, and 8 from cell 14. The big 8-move reaches all the way down to cell 6.',
    explanation:
      'Cell 14 is reachable iff cell 14-3=11, cell 14-5=9, or cell 14-8=6 is reachable, so the deciding cells are 6, 9, and 11. Cells 15–18 are forward of 14, and a cell like 12 or 13 is not exactly one move below it.',
  },
  {
    // diff 3 — preds {4,6,11}.
    id: 'cand-look-2-7-9-at-13',
    steps: 17,
    jumpSizes: [2, 7, 9],
    target: 13,
    variant: 'stairs',
    moveLabel: 'step',
    name: 'Maya',
    prompt:
      'Maya takes strides of 2, 7, or 9. Pick the earlier steps that determine whether step 13 is reachable.',
    hint: 'Subtract 2, 7, and 9 from 13. The uneven strides spread the three predecessors far apart.',
    explanation:
      'Step 13 depends on steps 13-2=11, 13-7=6, and 13-9=4, so the deciding steps are 4, 6, and 11. Steps 14–17 are irrelevant, and the dependency is exactly one stride back — not a neighbour like 12.',
  },
  {
    // diff 3 — preds {4,9,11}; 4 appears twice over (15-11 and 15-4 distinct) — distinct set.
    id: 'cand-look-4-6-11-at-15',
    steps: 19,
    jumpSizes: [4, 6, 11],
    target: 15,
    variant: 'array',
    moveLabel: 'pad',
    name: 'Pip the frog',
    prompt:
      'Pip the frog leaps 4, 6, or 11 pads. Which earlier pads decide whether pad 15 is reachable?',
    hint: 'Look back 4, 6, and 11 from pad 15. The longest leap of 11 drops you down near the start, at pad 4.',
    explanation:
      'Pad 15 is reachable iff pad 15-4=11, pad 15-6=9, or pad 15-11=4 is reachable, so the deciding pads are 4, 9, and 11. Pads 16–19 are ahead and cannot influence pad 15.',
  },
  {
    // diff 4 — preds {0,5,9}; the jump equal to target makes pad 0 a predecessor.
    id: 'cand-look-5-9-14-at-14',
    steps: 18,
    jumpSizes: [5, 9, 14],
    target: 14,
    variant: 'stairs',
    moveLabel: 'step',
    name: 'Robot R-14',
    prompt:
      'Robot R-14 hops 5, 9, or 14 steps. Select the earlier steps that determine whether step 14 is reachable.',
    hint: 'Subtract each hop from 14 — and remember a hop of 14 lands exactly on the start, step 0.',
    explanation:
      'Step 14 depends on steps 14-5=9, 14-9=5, and 14-14=0, so the deciding steps are 0, 5, and 9. The hop equal to the target makes step 0 a genuine predecessor (easy to miss). Steps 15–18 are forward and irrelevant.',
  },
  {
    // diff 4 — preds {0,6,9}; jump==target edge AND all multiples of 3.
    id: 'cand-look-3-6-12-at-12',
    steps: 16,
    jumpSizes: [3, 6, 12],
    target: 12,
    variant: 'array',
    moveLabel: 'cell',
    name: 'Maya',
    prompt:
      'Maya moves by 3, 6, or 12 cells. Which earlier cells decide whether cell 12 is reachable?',
    hint: 'Look back 3, 6, and 12 from cell 12. One of those moves lands exactly on cell 0 — do not forget the start.',
    explanation:
      'Cell 12 depends on cells 12-3=9, 12-6=6, and 12-12=0, so the deciding cells are 0, 6, and 9. The move of 12 makes cell 0 a predecessor. Cells 13–16 are ahead of 12 and never feed into it.',
  },
  {
    // diff 4 — preds {4,7}; the 15-jump exceeds target and is FILTERED OUT.
    id: 'cand-look-4-7-15-at-11',
    steps: 15,
    jumpSizes: [4, 7, 15],
    target: 11,
    variant: 'stairs',
    moveLabel: 'step',
    name: 'Robot R-11',
    prompt:
      'Robot R-11 hops 4, 7, or 15 steps. Select the earlier steps that determine whether step 11 is reachable.',
    hint: 'Subtract each hop from 11 — but a look-back must be a real step (index 0 or higher). What does 11 minus 15 give?',
    explanation:
      'Step 11 depends on steps 11-4=7 and 11-7=4, so the deciding steps are just 4 and 7. The hop of 15 would land at 11-15=-4, which is below the start and does not exist, so that move provides no predecessor.',
  },
];

// ===========================================================================
// 4) COIN CHANGE  (skill: coin-change)
//    Plain problems = exact-sum feasibility (no `1` coin, larger targets).
//    `fewest: true` problems = min-coins; each is a documented greedy trap.
//
//    Verified fewest traps (greedy-largest count vs optimum; first coin):
//      {1,4,5} t8  : greedy 5+1+1+1 = 4; optimum 4+4 = 2 (first coin 4, UNIQUE).
//      {1,6,7} t24 : greedy 7+7+7+1+1+1 = 6; optimum 6+6+6+6 = 4 (first 6, UNIQUE).
//      {1,5,8} t10 : greedy 8+1+1 = 3; optimum 5+5 = 2 (first 5, UNIQUE).
//      {1,9,10} t27: greedy 10+10+1×7 = 9; optimum 9+9+9 = 3 (first 9, UNIQUE).
//      {3,5}   t11 : greedy 5+5 STRANDS rem 1; optimum 5+3+3 = 3 (first NOT unique: 3 or 5).
//      {1,7,8} t21 : greedy 8+8+1×5 = 7; optimum 7+7+7 = 3 (first 7, UNIQUE).
// ===========================================================================
export const coinSumCandidates: CoinSumParams[] = [
  // ---- plain exact-sum (no fewest) ----
  {
    // diff 3 — reachable two ways; no 1 coin makes hitting 27 the puzzle.
    id: 'cand-coin-3-7-t27',
    coins: [3, 7],
    target: 27,
    prompt:
      'A token machine accepts only 3 and 7 credit tokens. Tap tokens until the slot reads exactly 27 credits.',
    hint: 'No 1 token exists. Fix how many 7s you use, then see if the remainder divides evenly into 3s.',
    explanation:
      'You can make 27 as nine 3s (3×9) or as 3 + 3 + 7 + 7 + 7 (two 3s and three 7s). With no 1-token, reaching the target exactly is the whole challenge; any exact-27 mix is accepted.',
  },
  {
    // diff 3 — unique exact combo.
    id: 'cand-coin-4-9-t30',
    coins: [4, 9],
    target: 30,
    prompt:
      'A locker bank takes 4 and 9 value coins. Build exactly 30 to open a locker.',
    hint: 'Try each count of 9s and check whether the leftover splits cleanly into 4s.',
    explanation:
      'The only exact-30 combination is 4 + 4 + 4 + 9 + 9 = 30 (three 4s and two 9s). Two 9s leave 12 = three 4s; any other count of 9s leaves a remainder that is not a multiple of 4.',
  },
  {
    // diff 4 — larger target, unique combo.
    id: 'cand-coin-5-8-t39',
    coins: [5, 8],
    target: 39,
    prompt:
      'A ferry turnstile accepts only 5 and 8 value tokens. Drop tokens to total exactly 39.',
    hint: 'How many 8s leave a multiple of 5 behind? Test 8s from high to low.',
    explanation:
      'The only exact-39 mix is 5 + 5 + 5 + 8 + 8 + 8 = 39 (three 5s and three 8s). Three 8s leave 15 = three 5s; no other count of 8s leaves a multiple of 5.',
  },
  {
    // diff 4 — both coins even multiples of 2; unique combo.
    id: 'cand-coin-6-10-t38',
    coins: [6, 10],
    target: 38,
    prompt:
      'A laundromat changer holds 6 and 10 value coins. Build exactly 38 to start a load.',
    hint: 'Both coins are even, so 38 (even) is plausible — find the count of 10s whose remainder splits into 6s.',
    explanation:
      'The only exact-38 combination is 6 + 6 + 6 + 10 + 10 = 38 (three 6s and two 10s). Two 10s leave 18 = three 6s; other counts of 10s strand an awkward remainder.',
  },
  // ---- fewest: true (greedy traps) ----
  {
    // diff 2 — greedy 5+1+1+1=4 vs 4+4=2; first coin 4 unique.
    id: 'cand-coin-1-4-5-t8-fewest',
    coins: [1, 4, 5],
    target: 8,
    fewest: true,
    prompt:
      'You are making 8 cents of change using 1, 4, and 5 cent coins. Use as FEW coins as possible.',
    hint: 'Think of best[8] as 1 + best[8 − coin]. Peeling off a 4 leaves another 4.',
    explanation:
      'Grabbing the biggest coin first gives 5 + 1 + 1 + 1 = 4 coins, but the optimum is 4 + 4 = 2 coins. The fewest-coins answer compares every first coin (and the unique best start is 4, not the larger 5).',
  },
  {
    // diff 3 — greedy 7+7+7+1+1+1=6 vs 6+6+6+6=4; first 6 unique.
    id: 'cand-coin-1-6-7-t24-fewest',
    coins: [1, 6, 7],
    target: 24,
    fewest: true,
    prompt:
      'A ticket kiosk dispenses 1, 6, and 7 value tickets. Reach exactly 24 using as few as possible.',
    hint: 'Compare 1 + best[24 − coin] across coins; the largest coin leaves an awkward remainder.',
    explanation:
      'Greedy takes 7 + 7 + 7 = 21, then 1 + 1 + 1 — six tickets in all. The optimum is 6 + 6 + 6 + 6 = 4 tickets. best[24] = min over coins of 1 + best[24 − coin] picks the 6, not the bigger 7.',
  },
  {
    // diff 2 — greedy 8+1+1=3 vs 5+5=2; first 5 unique.
    id: 'cand-coin-1-5-8-t10-fewest',
    coins: [1, 5, 8],
    target: 10,
    fewest: true,
    prompt:
      'A toll costs 10 and your purse holds 1, 5, and 8 value coins. Pay it in the fewest coins.',
    hint: 'The biggest coin overshoots into a remainder of 2 that needs two 1s — test every first coin.',
    explanation:
      'Greedy takes 8 first, leaving 2 = 1 + 1, for 8 + 1 + 1 = 3 coins. The optimum is 5 + 5 = 2 coins. The fewest-coins start is the 5, even though 8 is larger.',
  },
  {
    // diff 3 — greedy 10+10+1×7=9 vs 9+9+9=3; first 9 unique (dramatic gap).
    id: 'cand-coin-1-9-10-t27-fewest',
    coins: [1, 9, 10],
    target: 27,
    fewest: true,
    prompt:
      'A vending machine takes 1, 9, and 10 value coins and needs exactly 27. Pay in the fewest coins.',
    hint: 'Grabbing 10s first leaves 7 to mop up with 1s. Compare against leaning on the 9s.',
    explanation:
      'Greedy takes 10 + 10 = 20, then seven 1s — nine coins! The optimum is 9 + 9 + 9 = 3 coins. This is an extreme greedy trap: the unique optimal first coin is 9, and the largest coin is by far the worst start.',
  },
  {
    // diff 4 — STRANDING trap (no 1 coin): greedy 5+5 leaves unmakeable 1. first coin NOT unique.
    id: 'cand-coin-3-5-t11-fewest',
    coins: [3, 5],
    target: 11,
    fewest: true,
    prompt:
      'A parking meter accepts only 3 and 5 value coins and needs exactly 11. Pay it in the fewest coins.',
    hint: 'There is no 1 coin, so the biggest-first instinct can strand you on a remainder you can never finish.',
    explanation:
      'Greedy grabs 5 + 5 = 10, leaving 1 — which is impossible to make from 3s and 5s, a dead end. The only solution is 5 + 3 + 3 = 3 coins. (Note: the optimal first coin here is NOT unique — an optimum can start with either a 5 or a 3 — so this is a greedy-STRANDING trap, not a unique-first-coin trap.)',
  },
  {
    // diff 3 — greedy 8+8+1×5=7 vs 7+7+7=3; first 7 unique.
    id: 'cand-coin-1-7-8-t21-fewest',
    coins: [1, 7, 8],
    target: 21,
    fewest: true,
    prompt:
      'An arcade owes 21 in tickets of value 1, 7, and 8. Hand them out in the fewest tickets.',
    hint: 'Two 8s leave 5 to cover with 1s. Compare that against using the 7s — which divide 21 evenly.',
    explanation:
      'Greedy takes 8 + 8 = 16, then five 1s — seven tickets. The optimum is 7 + 7 + 7 = 3 tickets. The unique optimal first ticket is 7, not the larger 8.',
  },
];

// ===========================================================================
// 5) OPTIMAL FIRST CHOICE  (skill: optimal-choice)
//    App computes best first coin via best[a] = min over coins of 1 + best[a−c].
//    Every problem below is a greedy-biggest trap with a UNIQUE optimal first coin
//    (engine-confirmed optimalFirstCoins length === 1).
// ===========================================================================
export const minChoiceCandidates: MinChoiceParams[] = [
  {
    // diff 2 — first coin 4 (greedy 5 → 4 coins, opt 4+4 → 2).
    id: 'cand-min-1-4-5-a8',
    coins: [1, 4, 5],
    amount: 8,
    prompt:
      'You owe 8 and may pay with 1, 4, and 5 coins. Which single FIRST coin starts the fewest-coins solution?',
    hint: 'For each coin c, compare 1 + best[8 − c]; pick the coin that minimizes it.',
    explanation:
      'Starting with 5 forces 5 + 1 + 1 + 1 = 4 coins. Starting with 4 gives 4 + 4 = 2 coins, the minimum. The best first coin is 4, even though 5 is larger.',
  },
  {
    // diff 3 — first coin 6.
    id: 'cand-min-1-6-7-a24',
    coins: [1, 6, 7],
    amount: 24,
    prompt:
      'A cashier must give 24 in change using 1, 6, and 7 coins. Pick the best first coin to drop.',
    hint: 'Evaluate 1 + best[24 − c] for c = 1, 6, 7 and choose the smallest result.',
    explanation:
      'Choosing 7 first cascades to 7 + 7 + 7 + 1 + 1 + 1 = 6 coins. Choosing 6 first gives 6 + 6 + 6 + 6 = 4 coins. So 6 is the optimal first coin, not the bigger 7.',
  },
  {
    // diff 3 — first coin 7.
    id: 'cand-min-1-7-8-a21',
    coins: [1, 7, 8],
    amount: 21,
    prompt:
      'An arcade owes 21 and pays with 1, 7, and 8 coins. Which first coin leads to the fewest total coins?',
    hint: 'Compare 1 + best[21 − c] across the coins; 21 divides evenly by one of them.',
    explanation:
      'Starting with 8 leads to 8 + 8 + 1 + 1 + 1 + 1 + 1 = 7 coins. Starting with 7 gives 7 + 7 + 7 = 3 coins, the minimum. The best first coin is 7, not the larger 8.',
  },
  {
    // diff 3 — first coin 9 (extreme gap).
    id: 'cand-min-1-9-10-a27',
    coins: [1, 9, 10],
    amount: 27,
    prompt:
      'A machine must return 27 using 1, 9, and 10 coins. Choose the smartest first coin.',
    hint: 'Solve 1 + best[27 − c] for each coin; the largest coin leaves a remainder you mop up with 1s.',
    explanation:
      'Starting with 10 forces 10 + 10 + 1 × 7 = 9 coins. Starting with 9 gives 9 + 9 + 9 = 3 coins. The optimal first coin is 9 — a dramatic case where the biggest coin is the worst start.',
  },
  {
    // diff 3 — STRANDING: greedy 7 leaves unmakeable 1; only 2 works. first coin 2 unique.
    id: 'cand-min-2-7-a8',
    coins: [2, 7],
    amount: 8,
    prompt:
      'A parking meter accepts only 2 and 7 coins and needs exactly 8. Which first coin can actually finish the job?',
    hint: 'Check 1 + best[8 − c] for each coin — one choice leaves a remainder you can never complete.',
    explanation:
      'Grabbing the bigger 7 first leaves 1, which cannot be made from 2s and 7s — a dead end. Only 2 works: 2 + 2 + 2 + 2 = 4 coins, so 2 is the best (and only valid) first coin.',
  },
  {
    // diff 3 — STRANDING: greedy 7 leaves unmakeable 2; only 3 works. first coin 3 unique.
    id: 'cand-min-3-7-a9',
    coins: [3, 7],
    amount: 9,
    prompt:
      'A token gate accepts only 3 and 7 coins and needs exactly 9. Which first coin can finish the payment?',
    hint: 'One first coin strands you on a remainder no combination of 3s and 7s can complete.',
    explanation:
      'Starting with 7 leaves 2, unmakeable from 3s and 7s — a dead end. Only 3 works: 3 + 3 + 3 = 3 coins, so the optimal (and only valid) first coin is 3, not the larger 7.',
  },
  {
    // diff 3 — first coin 6 (greedy 8+8+1+1=4 vs 6+6+6=3).
    id: 'cand-min-1-6-8-a18',
    coins: [1, 6, 8],
    amount: 18,
    prompt:
      'A kiosk owes 18 in coins of value 1, 6, and 8. Which first coin starts the fewest-coins payout?',
    hint: 'Compare 1 + best[18 − c] for c = 1, 6, 8; one coin divides 18 evenly.',
    explanation:
      'Starting with 8 leads to 8 + 8 + 1 + 1 = 4 coins. Starting with 6 gives 6 + 6 + 6 = 3 coins. The optimal first coin is 6, even though 8 is larger.',
  },
  {
    // diff 3 — first coin 8 (greedy 9+9+1×6=8 vs 8+8+8=3).
    id: 'cand-min-1-8-9-a24',
    coins: [1, 8, 9],
    amount: 24,
    prompt:
      'A machine must return 24 using 1, 8, and 9 coins. Pick the best first coin to drop.',
    hint: 'Evaluate 1 + best[24 − c] for each coin; the largest value strands you on a remainder of 1s.',
    explanation:
      'Choosing 9 first cascades to 9 + 9 + 1 × 6 = 8 coins. Choosing 8 first gives 8 + 8 + 8 = 3 coins, the minimum. The optimal first coin is 8, not the bigger 9.',
  },
];

// ===========================================================================
// 6) CONCEPTS — recurrence-in-code (CodeBlanks) + spotting-the-pattern (MCQ).
//    Answers are author-specified (not engine-computed). Strictly within taught
//    recurrences. CodeBlanks obey the "one token id per blank" rule: no two
//    blanks in a slide ever share a token id. ids: cand-code-* / cand-mcq-*.
// ===========================================================================
export const conceptCandidates: Slide[] = [
  // ---- CodeBlanks (recurrence-code) ----
  {
    // diff 2 — staircase reachability sweep (OR feasibility).
    id: 'cand-code-stair-reach',
    type: 'checkpoint',
    component: 'CodeBlanks',
    props: {
      prompt:
        'The staircase reachability sweep: a step is reachable if some step one jump below it is. Drag the right pieces into the blanks.',
      codeLines: [
        [{ type: 'text', value: 'reachable = [False] * (n + 1)' }],
        [
          { type: 'text', value: 'reachable[' },
          { type: 'blank', id: 'ground' },
          { type: 'text', value: '] = True' },
        ],
        [{ type: 'text', value: 'for i in range(1, n + 1):' }],
        [{ type: 'text', value: '    for s in steps:' }],
        [
          { type: 'text', value: '        if i - s >= 0 and reachable[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: ']:' },
        ],
        [
          { type: 'text', value: '            reachable[' },
          { type: 'blank', id: 'current' },
          { type: 'text', value: '] = True' },
        ],
      ],
      tokens: [
        { id: 'zero', label: '0' },
        { id: 'iminuss', label: 'i - s' },
        { id: 'i', label: 'i' },
        { id: 'n', label: 'n' },
        { id: 'ipluss', label: 'i + s' },
        { id: 's', label: 's' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { ground: 'zero', lookback: 'iminuss', current: 'i' },
    },
    hint: 'Step 0 is always reachable (you start there). Step i is reachable if some earlier step i − s is.',
    explanationOnWrong:
      'Seed reachable[0] = True. Then step i is reachable when the earlier step i − s is reachable, so you read reachable[i − s] and set reachable[i]. Looking forward to i + s would read steps you have not computed yet.',
  },
  {
    // diff 3 — counting ordered ways (SUM combine, seed 1).
    id: 'cand-code-countways-coins',
    type: 'checkpoint',
    component: 'CodeBlanks',
    props: {
      prompt:
        'Counting the ordered ways to total an amount from coins. Same table shape as feasibility, but the combine step accumulates — choose the seed and the operator with care.',
      codeLines: [
        [{ type: 'text', value: 'ways = [0] * (target + 1)' }],
        [
          { type: 'text', value: 'ways[0] = ' },
          { type: 'blank', id: 'seed' },
        ],
        [{ type: 'text', value: 'for a in range(1, target + 1):' }],
        [{ type: 'text', value: '    for c in coins:' }],
        [{ type: 'text', value: '        if a - c >= 0:' }],
        [
          { type: 'text', value: '            ways[a] ' },
          { type: 'blank', id: 'op' },
          { type: 'text', value: ' ways[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: ']' },
        ],
      ],
      tokens: [
        { id: 'one', label: '1' },
        { id: 'zero', label: '0' },
        { id: 'aminusc', label: 'a - c' },
        { id: 'aplusc', label: 'a + c' },
        { id: 'plusEq', label: '+=' },
        { id: 'eq', label: '=' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { seed: 'one', op: 'plusEq', lookback: 'aminusc' },
    },
    hint: 'There is exactly one way to make amount 0 (use no coins), so ways[0] = 1. Each coin c reaches a from a − c, and every such way ACCUMULATES.',
    explanationOnWrong:
      'Seed ways[0] = 1 (one empty way); 0 would keep every count at 0. Each coin reaches a from a − c, and every predecessor adds its own count, so accumulate with += (a plain = overwrites and keeps only the last coin). Look back to a − c, not forward to a + c.',
  },
  {
    // diff 3 — fewest STEPS to climb (1 + min combine).
    id: 'cand-code-min-steps',
    type: 'checkpoint',
    component: 'CodeBlanks',
    props: {
      prompt:
        'The fewest-moves staircase table: each step stacks one move on top of the best smaller step. Pick the seed, the combine operator, and the cost of one move.',
      codeLines: [
        [{ type: 'text', value: 'best = [INF] * (n + 1)' }],
        [
          { type: 'text', value: 'best[0] = ' },
          { type: 'blank', id: 'seed' },
        ],
        [{ type: 'text', value: 'for i in range(1, n + 1):' }],
        [{ type: 'text', value: '    for s in steps:' }],
        [{ type: 'text', value: '        if i - s >= 0:' }],
        [
          { type: 'text', value: '            best[i] = ' },
          { type: 'blank', id: 'op' },
          { type: 'text', value: '(best[i], ' },
          { type: 'blank', id: 'plus' },
          { type: 'text', value: ' + best[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: '])' },
        ],
      ],
      tokens: [
        { id: 'zero', label: '0' },
        { id: 'one', label: '1' },
        { id: 'iminuss', label: 'i - s' },
        { id: 'ipluss', label: 'i + s' },
        { id: 'min', label: 'min' },
        { id: 'max', label: 'max' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { seed: 'zero', op: 'min', plus: 'one', lookback: 'iminuss' },
    },
    hint: 'It takes 0 moves to stand at step 0. Reaching step i costs exactly 1 move on top of the best way to reach i − s, and you want the FEWEST moves.',
    explanationOnWrong:
      'Seed best[0] = 0. One move adds 1 to the cost of the subproblem i − s, so the candidate is 1 + best[i − s]. Because you want the fewest moves, combine with min (max chases the most moves, and i + s looks past the goal).',
  },
  {
    // diff 2 — reachability via explicit OR of (self, predecessor).
    id: 'cand-code-reach-or',
    type: 'checkpoint',
    component: 'CodeBlanks',
    props: {
      prompt:
        'The same reachability sweep, written so each step ORs in one predecessor at a time. Fill the combine operator and the look-back index.',
      codeLines: [
        [{ type: 'text', value: 'reachable = [False] * (n + 1)' }],
        [{ type: 'text', value: 'reachable[0] = True' }],
        [{ type: 'text', value: 'for i in range(1, n + 1):' }],
        [{ type: 'text', value: '    for s in steps:' }],
        [{ type: 'text', value: '        if i - s >= 0:' }],
        [
          { type: 'text', value: '            reachable[i] = reachable[i] ' },
          { type: 'blank', id: 'op' },
          { type: 'text', value: ' reachable[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: ']' },
        ],
      ],
      tokens: [
        { id: 'orOp', label: 'or' },
        { id: 'andOp', label: 'and' },
        { id: 'iminuss', label: 'i - s' },
        { id: 'ipluss', label: 'i + s' },
        { id: 'i', label: 'i' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { op: 'orOp', lookback: 'iminuss' },
    },
    hint: 'A step is reachable if it is ALREADY reachable OR some predecessor i − s is. "Any one path is enough" means OR, not AND.',
    explanationOnWrong:
      'Reachability needs only ONE working predecessor, so you OR the look-backs (and would demand every predecessor work, which is wrong). The predecessor is i − s, the step one jump below i — never the forward i + s.',
  },
  {
    // diff 1 — coin feasibility: seed + look-back index only.
    id: 'cand-code-coin-feasible',
    type: 'checkpoint',
    component: 'CodeBlanks',
    props: {
      prompt:
        'Coin-change feasibility: can we make each amount at all? Drop the base index and the look-back amount into place.',
      codeLines: [
        [{ type: 'text', value: 'can_make = [False] * (amount + 1)' }],
        [
          { type: 'text', value: 'can_make[' },
          { type: 'blank', id: 'base' },
          { type: 'text', value: '] = True' },
        ],
        [{ type: 'text', value: 'for a in range(1, amount + 1):' }],
        [{ type: 'text', value: '    for c in coins:' }],
        [
          { type: 'text', value: '        if a - c >= 0 and can_make[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: ']:' },
        ],
        [{ type: 'text', value: '            can_make[a] = True' }],
      ],
      tokens: [
        { id: 'zero', label: '0' },
        { id: 'aminusc', label: 'a - c' },
        { id: 'aplusc', label: 'a + c' },
        { id: 'amount', label: 'amount' },
        { id: 'a', label: 'a' },
        { id: 'c', label: 'c' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { base: 'zero', lookback: 'aminusc' },
    },
    hint: 'Amount 0 is always makeable (use no coins). Amount a is makeable if a smaller already-solved amount a − c is.',
    explanationOnWrong:
      'Seed can_make[0] = True. An amount a becomes makeable the moment some earlier amount a − c is makeable, so you read can_make[a − c]. Reading a + c would look past the target.',
  },
  {
    // diff 3 — fewest coins: INF init + the +1 cost of laying one coin.
    id: 'cand-code-mincoins-init',
    type: 'checkpoint',
    component: 'CodeBlanks',
    props: {
      prompt:
        'The fewest-coins table again, but this time the INITIAL fill and the per-coin cost are hidden. What must the table start as so that min works, and what does laying one coin cost?',
      codeLines: [
        [
          { type: 'text', value: 'best = [' },
          { type: 'blank', id: 'init' },
          { type: 'text', value: '] * (amount + 1)' },
        ],
        [{ type: 'text', value: 'best[0] = 0' }],
        [{ type: 'text', value: 'for a in range(1, amount + 1):' }],
        [{ type: 'text', value: '    for c in coins:' }],
        [{ type: 'text', value: '        if a - c >= 0 and best[a - c] != INF:' }],
        [
          { type: 'text', value: '            best[a] = min(best[a], ' },
          { type: 'blank', id: 'plus' },
          { type: 'text', value: ' + best[a - c])' },
        ],
      ],
      tokens: [
        { id: 'inf', label: 'INF' },
        { id: 'zero', label: '0' },
        { id: 'one', label: '1' },
        { id: 'c', label: 'c' },
        { id: 'amount', label: 'amount' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { init: 'inf', plus: 'one' },
    },
    hint: 'For a min to ever improve, every unknown amount must start as something huge. And reaching a from a − c costs exactly one coin.',
    explanationOnWrong:
      'Fill the table with INF so any real solution beats the placeholder under min (starting at 0 would falsely report 0 coins). Laying one coin to drop from a to a − c adds exactly 1, so the candidate is 1 + best[a − c].',
  },

  // ---- MultipleChoice (pattern-reasoning) ----
  {
    // diff 2 — base case of fewest-coins table.
    id: 'cand-mcq-base-zero',
    type: 'checkpoint',
    component: 'MultipleChoice',
    props: {
      question:
        'In the fewest-coins table best[a] = 1 + min over coins of best[a − c], what must best[0] be seeded to?',
      options: [
        { id: 'zero', label: '0 — it takes no coins to make the amount 0.' },
        { id: 'one', label: '1 — you always need at least one coin.' },
        { id: 'inf', label: 'INF — amount 0 is a special unreachable case.' },
        { id: 'none', label: 'It does not matter; best[0] is never read.' },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['zero'] },
    hint: 'How many coins does it take to make a total of zero?',
    explanationOnWrong:
      'Making amount 0 needs no coins, so best[0] = 0. Every other entry builds on it as 1 + best[a − c]; if best[0] were 1 or INF, every count built from it would be off by one or blocked entirely. best[0] is read constantly (whenever a − c = 0).',
  },
  {
    // diff 2 — reachability combine = OR.
    id: 'cand-mcq-reach-or',
    type: 'checkpoint',
    component: 'MultipleChoice',
    props: {
      question:
        'In a reachability sweep with jumps {3, 5}, how do you combine the look-backs to decide cell 8?',
      options: [
        {
          id: 'or',
          label: 'OR: cell 8 is reachable if cell 5 (8−3) OR cell 3 (8−5) is reachable.',
        },
        {
          id: 'and',
          label: 'AND: cell 8 is reachable only if BOTH cell 5 and cell 3 are reachable.',
        },
        {
          id: 'sum',
          label: 'SUM: add the truth of cell 5 and cell 3 to get cell 8.',
        },
        {
          id: 'min',
          label: 'MIN: take the smaller of cell 5 and cell 3.',
        },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['or'] },
    hint: 'You only need ONE working path into a cell for it to be reachable.',
    explanationOnWrong:
      'Reachability is a yes/no OR: a single reachable predecessor (cell 5 or cell 3) is enough. AND would wrongly demand every predecessor; SUM and MIN belong to counting and fewest-coins, not feasibility.',
  },
  {
    // diff 3 — counting combine = SUM.
    id: 'cand-mcq-count-sum',
    type: 'checkpoint',
    component: 'MultipleChoice',
    props: {
      question:
        'When counting the number of ordered ways to climb with steps {1, 2}, how is ways[i] built from its look-backs?',
      options: [
        {
          id: 'sum',
          label: 'ways[i] = ways[i−1] + ways[i−2]: every predecessor contributes its own count.',
        },
        {
          id: 'or',
          label: 'ways[i] is True if ways[i−1] or ways[i−2] is non-zero.',
        },
        {
          id: 'min',
          label: 'ways[i] = 1 + min(ways[i−1], ways[i−2]).',
        },
        {
          id: 'max',
          label: 'ways[i] = max(ways[i−1], ways[i−2]).',
        },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['sum'] },
    hint: 'Each distinct last step gives a separate batch of paths. How do you total separate batches?',
    explanationOnWrong:
      'The paths ending in a 1-step and those ending in a 2-step are disjoint, so you ADD them: ways[i] = ways[i−1] + ways[i−2] (the Fibonacci recurrence). OR/min/max throw away the count — they answer feasibility or fewest, not "how many".',
  },
  {
    // diff 2 — look-back direction.
    id: 'cand-mcq-lookback-direction',
    type: 'checkpoint',
    component: 'MultipleChoice',
    props: {
      question:
        'A bottom-up tabulation fills cells left to right. With jumps {2, 6}, which cells may cell 10 safely read?',
      options: [
        { id: 'back', label: 'Cells 8 (10−2) and 4 (10−6) — its look-backs, already computed.' },
        { id: 'forward', label: 'Cells 12 (10+2) and 16 (10+6) — its look-aheads.' },
        { id: 'adjacent', label: 'Cell 9, directly before it.' },
        { id: 'all', label: 'Every earlier cell 0 through 9.' },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['back'] },
    hint: 'Subtract each jump from 10. A bottom-up loop can only trust cells it has ALREADY filled.',
    explanationOnWrong:
      'Cell 10 depends on i − jump, i.e. cells 8 and 4 — both already computed when the sweep reaches 10. Forward cells 12/16 are not yet filled, the adjacent cell 9 is not exactly one jump back, and you do not read all earlier cells, only the look-backs.',
  },
  {
    // diff 3 — greedy failure for {1,4,6} at 8 (engine-checked: opt 4+4=2, greedy 6+1+1=3).
    id: 'cand-mcq-greedy-146',
    type: 'checkpoint',
    component: 'MultipleChoice',
    props: {
      question:
        'Greedy (always grab the largest coin that fits) is optimal for {1, 5, 10, 25} but not in general. For coins {1, 4, 6}, at which amount does greedy use MORE coins than necessary?',
      options: [
        { id: 'eight', label: 'Amount 8: greedy takes 6 + 1 + 1 (3 coins), but 4 + 4 needs only 2.' },
        { id: 'twelve', label: 'Amount 12: greedy takes 6 + 6 (2 coins), which is already optimal.' },
        { id: 'six', label: 'Amount 6: greedy takes a single 6, the obvious optimum.' },
        { id: 'never', label: 'Greedy never fails for {1, 4, 6} because the coin 1 is included.' },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['eight'] },
    hint: 'Look for an amount where grabbing the 6 leaves an awkward remainder the 1s must mop up, versus leaning on the 4s.',
    explanationOnWrong:
      'At amount 8 greedy grabs 6, then pays 2 as 1 + 1 — three coins — while 4 + 4 makes 8 in two. (At 12, greedy 6 + 6 is already optimal, and at 6 a single coin is best.) Having a 1-coin guarantees you CAN make any amount, but not with the FEWEST coins.',
  },
  {
    // diff 4 — role of the +1 in the fewest-coins recurrence.
    id: 'cand-mcq-plus-one-role',
    type: 'checkpoint',
    component: 'MultipleChoice',
    props: {
      question:
        'In best[a] = 1 + min over coins c of best[a − c], what is the role of the "+ 1"?',
      options: [
        {
          id: 'onecoin',
          label: 'It counts the single coin c you lay down now to drop from a to a − c.',
        },
        {
          id: 'offbyone',
          label: 'It is an off-by-one fix for 0-indexing the table.',
        },
        {
          id: 'basecase',
          label: 'It is the base case for amount 0.',
        },
        {
          id: 'coinvalue',
          label: 'It adds the value of coin c to the running total.',
        },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['onecoin'] },
    hint: 'best counts COINS, not values. What did you just spend to get from a − c to a?',
    explanationOnWrong:
      'best[·] counts coins. Moving from the solved subproblem a − c up to a costs exactly one coin (the coin c), so you add 1 to best[a − c]. It is not an indexing fix, not the base case (that is best[0] = 0), and it adds a coin COUNT of 1, not the coin\u2019s value.',
  },
];
