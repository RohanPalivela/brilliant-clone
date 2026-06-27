import type { LookbackParams } from '../reviewBuilders';

// Look-back dependency problems. The correct cells are exactly {target - j} for
// each jump j with target - j >= 0; jumps larger than target are filtered out
// (no negative cell). `steps` sits a few cells ABOVE target so there are forward
// decoy cells the learner must NOT pick.
//
// Difficulty (1–5) tracks predecessor count and how spread out / edge-casey they
// are: clustered consecutive predecessors are easy (1–2); wide spreads, the
// jump==target edge (cell 0 becomes a predecessor), oversized-jump filtering, and
// four-predecessor sets are harder (3–4). Look-back tops out around 4 — there is
// no genuinely "hard" beyond more-spread predecessors. Ordered ASCENDING.
export const lookbackProblems: LookbackParams[] = [
  {
    id: 'rb-look-1-2-3-at-8',
    difficulty: 1,
    steps: 12,
    jumpSizes: [1, 2, 3],
    target: 8, // predecessors: 8-1=7, 8-2=6, 8-3=5 -> {5, 6, 7}
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
    id: 'rb-look-2-4-6-at-10',
    difficulty: 2,
    steps: 14,
    jumpSizes: [2, 4, 6],
    target: 10, // predecessors: 10-2=8, 10-4=6, 10-6=4 -> {4, 6, 8}
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
    id: 'rb-look-3-5-8-at-14',
    difficulty: 3,
    steps: 18,
    jumpSizes: [3, 5, 8],
    target: 14, // predecessors: 14-3=11, 14-5=9, 14-8=6 -> {6, 9, 11}
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
    id: 'rb-look-4-6-11-at-15',
    difficulty: 3,
    steps: 19,
    jumpSizes: [4, 6, 11],
    target: 15, // predecessors: 15-4=11, 15-6=9, 15-11=4 -> {4, 9, 11}
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
    id: 'rb-look-2-7-9-at-13',
    difficulty: 3,
    steps: 17,
    jumpSizes: [2, 7, 9],
    target: 13, // predecessors: 13-2=11, 13-7=6, 13-9=4 -> {4, 6, 11}
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
    id: 'rb-look-5-9-14-at-14',
    difficulty: 3,
    steps: 18,
    jumpSizes: [5, 9, 14],
    target: 14, // predecessors: 14-5=9, 14-9=5, 14-14=0 -> {0, 5, 9}
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
    id: 'rb-look-4-7-15-at-11',
    difficulty: 3,
    steps: 15,
    jumpSizes: [4, 7, 15],
    target: 11, // predecessors: 11-4=7, 11-7=4, 11-15=-4 (filtered) -> {4, 7}
    variant: 'stairs',
    moveLabel: 'step',
    name: 'Robot R-11',
    prompt:
      'Robot R-11 hops 4, 7, or 15 steps. Select the earlier steps that determine whether step 11 is reachable.',
    hint: 'Subtract each hop from 11 — but a look-back must be a real step (index 0 or higher). What does 11 minus 15 give?',
    explanation:
      'Step 11 depends on steps 11-4=7 and 11-7=4, so the deciding steps are just 4 and 7. The hop of 15 would land at 11-15=-4, which is below the start and does not exist, so that move provides no predecessor.',
  },
  {
    id: 'rb-look-2-5-7-at-11',
    difficulty: 3,
    steps: 15,
    jumpSizes: [2, 5, 7],
    target: 11, // predecessors: 11-2=9, 11-5=6, 11-7=4 -> {4, 6, 9}
    variant: 'array',
    moveLabel: 'step',
    name: 'Maya',
    prompt:
      'Maya climbs with strides of 2, 5, or 7. To decide whether cell 11 is reachable, which earlier cells must she already know about?',
    hint: 'Subtract each stride from 11. With three strides there are three look-backs, and a stride of 7 reaches all the way down to cell 4.',
    explanation:
      'Cell 11 is reachable iff cell 11-2 = 9, cell 11-5 = 6, or cell 11-7 = 4 is reachable, so the deciding cells are 4, 6, and 9. Cells 12–15 are above 11 and can never feed into it, and neighbours like 10 or 5 are not exactly one stride below 11.',
  },
  {
    id: 'rb-look-3-4-8-at-12',
    difficulty: 3,
    steps: 16,
    jumpSizes: [3, 4, 8],
    target: 12, // predecessors: 12-3=9, 12-4=8, 12-8=4 -> {4, 8, 9}
    variant: 'stairs',
    moveLabel: 'hop',
    name: 'Pip the frog',
    prompt:
      'Pip the frog hops 3, 4, or 8 steps at a time. Select the earlier steps that determine whether step 12 can be reached.',
    hint: 'The look-backs of 12 are 12 minus each hop. The big hop of 8 lands far below, at step 4.',
    explanation:
      'Step 12 depends on steps 12-3 = 9, 12-4 = 8, and 12-8 = 4, so the deciding steps are 4, 8, and 9. Steps 13–16 sit above 12 and are irrelevant, and a step like 10 or 11 is not exactly one hop below 12.',
  },
  {
    id: 'rb-look-2-6-9-at-13',
    difficulty: 3,
    steps: 17,
    jumpSizes: [2, 6, 9],
    target: 13, // predecessors: 13-2=11, 13-6=7, 13-9=4 -> {4, 7, 11}
    variant: 'array',
    moveLabel: 'cell',
    name: 'Robot R-13',
    prompt:
      'Robot R-13 moves forward by 2, 6, or 9 cells. Which earlier cells decide whether cell 13 is reachable?',
    hint: 'Look back 2, 6, and 9 from cell 13. The moves are uneven, so the three predecessors are spread out, not bunched together.',
    explanation:
      'Cell 13 is reachable iff cell 13-2 = 11, cell 13-6 = 7, or cell 13-9 = 4 is reachable, so the deciding cells are 4, 7, and 11. Cells 14–17 are forward of 13 and cannot influence it, and cells like 12 or 5 are not exactly one move below 13.',
  },
  {
    id: 'rb-look-3-8-17-at-12',
    difficulty: 3,
    steps: 16,
    jumpSizes: [3, 8, 17],
    target: 12, // predecessors: 12-3=9, 12-8=4, 12-17=-5 (filtered) -> {4, 9}
    variant: 'stairs',
    moveLabel: 'hop',
    name: 'Robot R-12',
    prompt:
      'Robot R-12 hops 3, 8, or 17 steps. Select the earlier steps that determine whether step 12 is reachable.',
    hint: 'Subtract each hop from 12 — but a look-back must be a real step (index 0 or higher). What does 12 minus 17 give?',
    explanation:
      'Step 12 depends on steps 12-3 = 9 and 12-8 = 4, so the deciding steps are just 4 and 9. The hop of 17 would land at 12-17 = -5, which is below the start and does not exist, so that move provides no predecessor. Steps above 12 are also irrelevant.',
  },
  {
    id: 'rb-look-4-7-13-at-13',
    difficulty: 3,
    steps: 17,
    jumpSizes: [4, 7, 13],
    target: 13, // predecessors: 13-4=9, 13-7=6, 13-13=0 -> {0, 6, 9}
    variant: 'array',
    moveLabel: 'cell',
    name: 'Robot R-13',
    prompt:
      'Robot R-13 moves by 4, 7, or 13 cells. Which earlier cells decide whether cell 13 is reachable?',
    hint: 'Look back 4, 7, and 13 from cell 13. A move of 13 lands exactly on cell 0 — do not forget the start.',
    explanation:
      'Cell 13 is reachable iff cell 13-4 = 9, 13-7 = 6, or 13-13 = 0 is reachable, so the deciding cells are 0, 6, and 9. The move equal to the target makes cell 0 a predecessor, which is easy to overlook. Cells 14–17 are forward of 13 and cannot affect it.',
  },
  {
    id: 'rb-look-3-7-11-at-14',
    difficulty: 4,
    steps: 18,
    jumpSizes: [3, 7, 11],
    target: 14, // predecessors: 14-3=11, 14-7=7, 14-11=3 -> {3, 7, 11}
    variant: 'stairs',
    moveLabel: 'step',
    name: 'Maya',
    prompt:
      'Maya takes strides of 3, 7, or 11. Pick the earlier steps that determine whether step 14 is reachable.',
    hint: 'Subtract 3, 7, and 11 from 14. The longest stride of 11 reaches almost to the bottom, at step 3.',
    explanation:
      'Step 14 depends on steps 14-3 = 11, 14-7 = 7, and 14-11 = 3, so the deciding steps are 3, 7, and 11. Everything above 14 (steps 15–18) is irrelevant, and the dependency is exactly one stride back — step 4 or 10, for instance, is not a look-back of 14.',
  },
  {
    id: 'rb-look-2-5-9-16-at-16',
    difficulty: 4,
    steps: 20,
    jumpSizes: [2, 5, 9, 16],
    target: 16, // predecessors: 16-2=14, 16-5=11, 16-9=7, 16-16=0 -> {0, 7, 11, 14}
    variant: 'array',
    moveLabel: 'pad',
    name: 'Pip the frog',
    prompt:
      'Pip the frog can leap 2, 5, 9, or 16 pads. Which earlier pads decide whether pad 16 is reachable?',
    hint: 'There are four leaps, so four look-backs. Watch the leap of 16: it reaches pad 16-16 = 0, the very start.',
    explanation:
      'Pad 16 is reachable iff pad 16-2 = 14, 16-5 = 11, 16-9 = 7, or 16-16 = 0 is reachable, so the deciding pads are 0, 7, 11, and 14. The leap of 16 makes pad 0 a genuine predecessor — a commonly missed edge case. Pads 17–20 are above 16 and never feed into it.',
  },
];
