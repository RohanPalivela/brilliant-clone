import type { ReachabilityParams } from '../reviewBuilders';

// Reachability sweep problems. Step 0 is always reachable; a step i is reachable
// iff some (i - j) for an allowed jump j is itself reachable. The engine derives
// the truth, so any small, friendly numbers are valid here.
export const reachabilityProblems: ReachabilityParams[] = [
  {
    id: 'rb-reach-climb-2-3',
    steps: 10,
    jumpSizes: [2, 3],
    variant: 'stairs',
    prompt:
      'You start on the ground (step 0) of a 10-step staircase and can climb either 2 or 3 steps at a time. Mark every step you can possibly land on.',
    hint: 'A step is reachable only if the step 2 below OR 3 below is already reachable. Sweep upward from 0.',
    explanation:
      'Work left to right: step 0 is free. With jumps of 2 and 3, step 1 is unreachable (no -2 or -3 landing exists), but step 2 (=0+2) and step 3 (=0+3) are. From there every later step has a reachable predecessor, so steps 2-10 are all reachable and only step 1 stays out of reach.',
  },
  {
    id: 'rb-reach-frog-3-5',
    steps: 12,
    jumpSizes: [3, 5],
    variant: 'array',
    prompt:
      'A frog sits on lily pad 0 in a row of pads numbered 0-12. Each hop covers exactly 3 or 5 pads forward. Tick the pads the frog can ever reach.',
    hint: 'Pad i is reachable when pad i-3 or pad i-5 is reachable. Start from pad 0 and propagate forward.',
    explanation:
      'With hops of 3 and 5 the frog reaches 3, 5, 6 (3+3), 8, 9, 10, 11, 12, but pads 1, 2, 4, and 7 have no reachable pad 3 or 5 behind them, so they stay unmarked. Reachability is OR over the predecessors, not a single fixed pattern.',
  },
  {
    id: 'rb-reach-2-5-stairs',
    steps: 8,
    jumpSizes: [2, 5],
    variant: 'stairs',
    prompt:
      'Climbing an 8-step staircase from step 0, your legs only allow strides of 2 or 5 steps. Mark each step that is reachable.',
    hint: 'Check, for each step, whether the step 2 lower or 5 lower is already reachable.',
    explanation:
      'From 0 you get 2, 4, 5 (=0+5), 6, 7 (=2+5), 8. Step 1 and step 3 are stranded because neither their -2 nor -5 predecessor is reachable. A gap below a step does not block steps above it as long as some other route exists.',
  },
  {
    id: 'rb-reach-robot-4-6',
    steps: 14,
    jumpSizes: [4, 6],
    variant: 'array',
    prompt:
      'A robot starts at cell 0 on a number line of cells 0-14 and may move forward by 4 or 6 each turn. Highlight every cell it can occupy.',
    hint: 'Because both jumps are even, think about which parities can ever be reached from 0.',
    explanation:
      'Both 4 and 6 are even, so starting from even cell 0 the robot can only ever land on even cells: 0, 4, 6, 8, 10, 12, 14 (and 2 stays unreachable because neither -4 nor -6 lands on a reachable cell). Every odd cell is impossible. The allowed jumps decide the reachable set.',
  },
  {
    id: 'rb-reach-2-3-4-stairs',
    steps: 9,
    jumpSizes: [2, 3, 4],
    variant: 'stairs',
    prompt:
      'On a 9-step staircase you may climb 2, 3, or 4 steps in a single bound, beginning at step 0. Mark all reachable steps.',
    hint: 'With three jump options a step is reachable if ANY of i-2, i-3, or i-4 is reachable.',
    explanation:
      'Step 0 is free; step 1 is the only unreachable one (no -2, -3, or -4 predecessor exists). Steps 2 through 9 all have at least one reachable predecessor among i-2, i-3, i-4, so they are reachable. More jump options means more cells light up.',
  },
  {
    id: 'rb-reach-array-3-4',
    steps: 11,
    jumpSizes: [3, 4],
    variant: 'array',
    prompt:
      'Cells 0-11 sit in a row. From cell 0 you may advance by 3 or 4 cells per move. Mark each cell that can be landed on.',
    hint: 'Sweep upward: cell i is reachable when cell i-3 or cell i-4 is reachable.',
    explanation:
      'From 0 you reach 3, 4, 6 (3+3), 7 (3+4), 8 (4+4), 9, 10, 11. Cells 1, 2, and 5 are unreachable: 5 fails because neither cell 2 (5-3) nor cell 1 (5-4) is reachable. Always test both predecessors before marking.',
  },
  {
    id: 'rb-reach-2-4-6-tall',
    steps: 16,
    jumpSizes: [2, 4, 6],
    variant: 'stairs',
    prompt:
      'A tall 16-step staircase lets you bound up 2, 4, or 6 steps at once, starting from step 0. Mark every step you can reach.',
    hint: 'All three jumps share a common factor. Which steps can that ever reach?',
    explanation:
      'Jumps 2, 4, and 6 are all even, so from even step 0 only even steps (0, 2, 4, ..., 16) are reachable; every odd step is impossible. The reachable set is exactly the even steps, dictated entirely by the jump sizes.',
  },
];
