import type { Lesson } from '../../types/content';

// Lesson 1 — The staircase problem. Reachability discovered bottom-up
// (jumps of 3 or 5, target 11). Direct-instruction shape: show the problem with
// a labeled diagram, walk a smaller staircase step-by-step at the learner's own
// pace, name the look-backward idea, then guided + independent practice, then an
// animated DPTable replays the sweep.
export const lesson1: Lesson = {
  id: 'reach-the-top',
  courseId: 'dynamic-programming-mastery',
  title: 'The Staircase Problem',
  order: 1,
  estimatedMinutes: 13,
  slides: [
    {
      id: 'm1-s1',
      type: 'explain',
      component: 'StairGrid',
      props: {
        steps: 8,
        jumpSizes: [3, 5],
        editable: false,
        showSolution: true,
        arrowTargets: [3, 5, 8],
        highlightIndices: [0, 3, 5, 8],
        loop: true,
        prompt:
          'You start on the ground — step 0 — and every move climbs exactly 3 or 5 steps, only upward.\nThe arrows show the idea: from a step you can jump +3 or +5, and you chain those jumps to climb higher.\nThe question for any step: can you land on it exactly?',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s2',
      type: 'explore',
      component: 'StaircaseWalkthrough',
      props: {
        steps: 6,
        jumpSizes: [3, 5],
        prompt:
          'Watch me solve a shorter staircase first — one step at a time. Press Next (or use ← →) to decide each step at your own pace.',
        caption:
          'Each step is decided using only the steps below it — exactly the move you’ll use yourself in a moment.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s3',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Look backward, not forward',
        body: 'Why not just follow every jump forward from the ground? Because that explodes into a tangle of paths to trace — far too many to check by hand.',
        emphasis:
          'So we flip it around: to know if a step is reachable, we only ask whether the steps one jump before it are reachable. We move forward to reach the goal, but look backward to decide each step.',
        bodyFirst: true,
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s4',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'To land on `step 7`, you can only arrive from `step 4` (that’s `7 − 3`) or `step 2` (that’s `7 − 5`).\nBoth step 4 and step 2 are unreachable from the ground.\nSo — is step 7 reachable from the ground?',
        options: [
          { id: 'reach', label: 'Reachable' },
          { id: 'no', label: 'Not reachable' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['no'] },
      hint: 'You can only arrive at a step by jumping from a reachable one. If both steps below it (by 3 and by 5) are dead, so is this step.',
      explanationOnWrong:
        'A step is reachable only if you can land on it from a reachable step. Step 7’s two predecessors (4 and 2) are both ✗, so step 7 is ✗ too. Each step is decided entirely by the steps below it.',
    },
    {
      id: 'm1-s5',
      type: 'checkpoint',
      component: 'StairGrid',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 11,
        editable: true,
        showArrows: true,
        prompt:
          'Your turn — solve the whole staircase to step 11. Start at the bottom (step 0 is already ✓) and work upward, one step at a time. Tap a step once to mark it ✓ if it can be reached, tap again for ✗ if it can’t. A step is ✓ only when the step 3 below or 5 below it is ✓.',
      },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 11, target: 11 },
      hint: 'A step is ✓ only if (step − 3) or (step − 5) is itself ✓. Work upward from step 0, which is always ✓.',
      explanationOnWrong:
        'Not quite. Start at step 0 (always ✓) and work upward: each step is ✓ only when step − 3 or step − 5 is ✓.',
    },
    {
      id: 'm1-s6',
      type: 'explore',
      component: 'DPTable',
      props: {
        mode: 'reachability',
        steps: 11,
        jumpSizes: [3, 5],
        prompt:
          'That’s the whole algorithm: each cell looks back only 3 and 5 to its left — never re-tracing every jump from the ground. Press play and watch the same rule fill the row, left to right.',
        caption: 'One sweep, each answer built from the ones before it.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s7',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'You just did dynamic programming',
        body: 'Instead of replaying every jump from the ground, you built each answer from smaller answers you already trusted.',
        emphasis:
          'To know if step 11 is reachable, you only need steps 8 and 6 — that’s 11 − 3 and 11 − 5.',
        bodyFirst: true,
        visual: {
          component: 'StairGrid',
          steps: 11,
          jumpSizes: [3, 5],
          highlightIndices: [6, 8, 11],
        },
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s8',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'This is bottom-up thinking',
        body: 'Determine the next state from the previous ones. Next, let’s give the staircase a memory and translate this into code.',
      },
      validation: { type: 'none' },
    },
  ],
};
