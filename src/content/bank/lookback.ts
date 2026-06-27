import type { LookbackParams } from '../reviewBuilders';

// Look-back dependency problems. The correct cells are exactly {target - j} for
// each jump j (indices >= 0). steps sits a few cells above target so there are
// forward (wrong) cells to avoid, and target >= max(jumpSizes) gives 2+ valid
// predecessors.
export const lookbackProblems: LookbackParams[] = [
  {
    id: 'rb-look-2-3-at-6',
    steps: 10,
    jumpSizes: [2, 3],
    target: 6, // predecessors: 6-2=4, 6-3=3
    variant: 'array',
    moveLabel: 'step',
    prompt:
      'Maya climbs with strides of 2 or 3. To decide whether step 6 is reachable, which earlier steps must she already know about?',
    hint: 'Reachability of a step depends only on the steps exactly one jump below it.',
    explanation:
      'Step 6 is reachable iff step 6-2 = 4 or step 6-3 = 3 is reachable, so the deciding cells are steps 4 and 3. Steps above 6 are irrelevant, and steps like 5 or 2 are not exactly one jump below 6.',
  },
  {
    id: 'rb-look-3-5-at-8',
    steps: 12,
    jumpSizes: [3, 5],
    target: 8, // predecessors: 8-3=5, 8-5=3
    variant: 'stairs',
    moveLabel: 'hop',
    prompt:
      'Hops of 3 or 5 carry you up a staircase. Select the earlier steps that determine whether step 8 can be reached.',
    hint: 'Subtract each allowed hop from 8 to find the steps it depends on.',
    explanation:
      'Step 8 depends on step 8-3 = 5 and step 8-5 = 3. If either of those is reachable, so is 8. Cells beyond 8 cannot influence it, and 8 looks back exactly one hop at a time.',
  },
  {
    id: 'rb-look-2-5-at-7',
    steps: 11,
    jumpSizes: [2, 5],
    target: 7, // predecessors: 7-2=5, 7-5=2
    variant: 'array',
    moveLabel: 'pad',
    prompt:
      'A frog hops 2 or 5 pads at a time. Which earlier pads decide whether pad 7 is reachable?',
    hint: 'The predecessors of pad 7 are pad 7 minus each hop size.',
    explanation:
      'Pad 7 is reachable iff pad 7-2 = 5 or pad 7-5 = 2 is reachable, so the deciding pads are 5 and 2. Other nearby pads (like 6 or 3) are not exactly one hop below 7.',
  },
  {
    id: 'rb-look-4-6-at-10',
    steps: 14,
    jumpSizes: [4, 6],
    target: 10, // predecessors: 10-4=6, 10-6=4
    variant: 'stairs',
    moveLabel: 'step',
    prompt:
      'Strides of 4 or 6 are allowed. Pick the earlier steps that determine whether step 10 is reachable.',
    hint: 'Look back exactly 4 and exactly 6 from step 10.',
    explanation:
      'Step 10 depends on step 10-4 = 6 and step 10-6 = 4. Only those two predecessors matter; if either is reachable then 10 is, regardless of any step above 10.',
  },
  {
    id: 'rb-look-2-3-4-at-9',
    steps: 13,
    jumpSizes: [2, 3, 4],
    target: 9, // predecessors: 9-2=7, 9-3=6, 9-4=5
    variant: 'array',
    moveLabel: 'cell',
    prompt:
      'A robot moves forward by 2, 3, or 4 cells. Which earlier cells decide whether cell 9 can be reached?',
    hint: 'With three move sizes, cell 9 has three predecessors — one per move.',
    explanation:
      'Cell 9 looks back to cells 9-2 = 7, 9-3 = 6, and 9-4 = 5. If any of those is reachable, cell 9 is too. More move options means more predecessor cells to consider.',
  },
  {
    id: 'rb-look-3-4-at-8',
    steps: 12,
    jumpSizes: [3, 4],
    target: 8, // predecessors: 8-3=5, 8-4=4
    variant: 'stairs',
    moveLabel: 'step',
    prompt:
      'Jumps of 3 or 4 climb the staircase. Select the earlier steps that determine whether step 8 is reachable.',
    hint: 'Subtract each jump from 8 to find which steps it depends on.',
    explanation:
      'Step 8 is reachable iff step 8-3 = 5 or step 8-4 = 4 is reachable, so the deciding steps are 5 and 4. Steps above 8 never affect it, and the dependency is exactly one jump back.',
  },
];
