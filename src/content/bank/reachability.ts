import type { ReachabilityParams } from '../reviewBuilders';

// Reachability sweep problems. Step 0 is always reachable; a step i is reachable
// iff some (i - j) for an allowed jump j is itself reachable. The engine derives
// the truth, so the prose below is written to match the COMPUTED reachable set
// for each board.
//
// Difficulty (1–5) tracks board size, jump count, and gap density: a tiny board
// with a 1-jump (nothing strands) is a 1; a large coprime board whose gaps run
// deep into the middle is a 5. The array is ordered ASCENDING by difficulty so a
// seeder can introduce an easy→hard ramp by array index. Every board is solved by
// mechanically applying the OR look-back rule — no parity / Frobenius reasoning,
// which the lessons never teach.
export const reachabilityProblems: ReachabilityParams[] = [
  {
    id: 'rb-reach-1-2-stairs',
    difficulty: 1,
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
    id: 'rb-reach-2-3-array',
    difficulty: 2,
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
    id: 'rb-reach-3-4-stairs',
    difficulty: 2,
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
    id: 'rb-reach-2-3-7-array',
    difficulty: 2,
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
    id: 'rb-reach-3-5-array',
    difficulty: 3,
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
    id: 'rb-reach-2-7-stairs',
    difficulty: 3,
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
    id: 'rb-reach-4-6-9-array',
    difficulty: 3,
    steps: 20,
    jumpSizes: [4, 6, 9],
    variant: 'array',
    prompt:
      'A robot starts at cell 0 on a number line of cells 0-20 and may move forward by 4, 6, or 9 each turn. Highlight every cell it can occupy.',
    hint: 'Three jumps means cell i is reachable if ANY of i-4, i-6, or i-9 is reachable. Sweep carefully — the gaps are not all even or all odd.',
    explanation:
      'The jumps 4, 6, 9 share no common factor, so both parities are reachable. The reachable cells are 0, 4, 6, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20. The unreachable cells are 1, 2, 3, 5, 7, and 11. Cell 5 and cell 7 are stuck even though they sit between reachable cells, and 11 is the last gap (11-4=7, 11-6=5, 11-9=2 are all unreachable). From 12 up everything lights up.',
  },
  {
    id: 'rb-reach-5-8-array',
    difficulty: 4,
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
    id: 'rb-reach-4-9-stairs',
    difficulty: 4,
    steps: 22,
    jumpSizes: [4, 9],
    variant: 'stairs',
    prompt:
      'A climber on a 22-rung wall starts at rung 0 and pulls up 4 or 9 rungs each time. Mark every rung the climber can land on.',
    hint: 'Rung i is reachable when rung i-4 or rung i-9 is. The 9-jump reaches odd rungs too, so both even and odd rungs eventually appear — but several stay stranded surprisingly high.',
    explanation:
      'Reachable rungs are 0, 4, 8, 9, 12, 13, 16, 17, 18, 20, 21, 22. The gaps are 1, 2, 3, 5, 6, 7, 10, 11, 14, 15, and 19. Note 14 and 15 are stranded mid-board, and 19 is the final gap (19-4=15, 19-9=10 both unreachable). From 20 up everything is reachable.',
  },
  {
    id: 'rb-reach-3-7-stairs',
    difficulty: 4,
    steps: 15,
    jumpSizes: [3, 7],
    variant: 'stairs',
    prompt:
      'You start on the ground (step 0) of a 15-step staircase and can climb either 3 or 7 steps at a time. Mark every step you can possibly land on.',
    hint: 'Step i is reachable only if step i-3 OR step i-7 is already reachable. Sweep upward from 0 and do not assume a simple pattern.',
    explanation:
      'Sweeping up with jumps of 3 and 7: reachable steps are 0, 3, 6, 7, 9, 10, 12, 13, 14, 15. The unreachable ones are scattered: 1, 2, 4, 5, 8, and 11. Notice 8 fails (8-3=5 and 8-7=1 are both unreachable) and 11 is the LAST gap (11-3=8 and 11-7=4 are both unreachable). From step 12 onward every step has a reachable predecessor, so the gaps live in the middle, not just at the start.',
  },
  {
    id: 'rb-reach-4-5-array',
    difficulty: 4,
    steps: 18,
    jumpSizes: [4, 5],
    variant: 'array',
    prompt:
      'A frog sits on lily pad 0 in a row of pads numbered 0-18. Each hop covers exactly 4 or 5 pads forward. Tick the pads the frog can ever reach.',
    hint: 'Pad i is reachable when pad i-4 or pad i-5 is reachable. Propagate forward from 0; several middle pads stay stranded.',
    explanation:
      'With hops of 4 and 5 the reachable pads are 0, 4, 5, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18. The unreachable pads are 1, 2, 3, 6, 7, and 11. Pads 6 and 7 look close to the start but have no reachable -4 or -5 predecessor, and 11 is the final gap (11-4=7 and 11-5=6 are both unreachable). Once you pass 11, every pad is reachable.',
  },
  {
    id: 'rb-reach-5-6-stairs',
    difficulty: 5,
    steps: 22,
    jumpSizes: [5, 6],
    variant: 'stairs',
    prompt:
      'Climbing a tall 22-step staircase from step 0, your legs only allow strides of 5 or 6 steps. Mark each step that is reachable.',
    hint: 'Check, for each step, whether the step 5 lower or 6 lower is already reachable. The gaps keep appearing well past the bottom.',
    explanation:
      'With strides of 5 and 6 the reachable steps are 0, 5, 6, 10, 11, 12, 15, 16, 17, 18, 20, 21, 22. The unreachable steps are 1, 2, 3, 4, 7, 8, 9, 13, 14, and 19. The dangerous ones are deep in the middle: 13 and 14 are stranded (their -5 and -6 predecessors are both unreachable), and 19 is the very LAST gap before the board fills in. After step 19 everything is reachable.',
  },
  {
    id: 'rb-reach-4-7-array',
    difficulty: 5,
    steps: 20,
    jumpSizes: [4, 7],
    variant: 'array',
    prompt:
      'Cells 0-20 sit in a row. From cell 0 you may advance by 4 or 7 cells per move. Mark each cell that can be landed on.',
    hint: 'Sweep upward: cell i is reachable when cell i-4 or cell i-7 is reachable. Test BOTH predecessors before marking a cell.',
    explanation:
      'From 0 with steps of 4 and 7 the reachable cells are 0, 4, 7, 8, 11, 12, 14, 15, 16, 18, 19, 20. The unreachable cells are 1, 2, 3, 5, 6, 9, 10, 13, and 17. Watch the middle: cells 9 and 10 fail (9-4=5, 9-7=2 and 10-4=6, 10-7=3 are all unreachable), 13 fails too, and 17 is the final gap (17-4=13 and 17-7=10 are both unreachable). From 18 on, every cell is reachable.',
  },
  {
    id: 'rb-reach-5-7-climb',
    difficulty: 5,
    steps: 22,
    jumpSizes: [5, 7],
    variant: 'stairs',
    prompt:
      'A climber on a 22-rung wall starts at rung 0 and can reach 5 or 7 rungs higher each pull. Mark every rung the climber can land on.',
    hint: 'Rung i is reachable when rung i-5 or rung i-7 is reachable. With these jumps the gaps reach surprisingly high — do not assume the top is all reachable.',
    explanation:
      'With pulls of 5 and 7 the reachable rungs are 0, 5, 7, 10, 12, 14, 15, 17, 19, 20, 21, 22. The unreachable rungs are 1, 2, 3, 4, 6, 8, 9, 11, 13, 16, and 18. The tricky part is near the top: even rung 16 (16-5=11, 16-7=9 both unreachable) and rung 18 (18-5=13, 18-7=11 both unreachable) stay stranded, while 17, 19, 20, 21, 22 are reachable. You truly have to run the sweep to the very end.',
  },
];
