import type { Lesson } from '../../types/content';

// Lesson 1 — Reachability discovered bottom-up (jumps of 3 or 5, target 11).
// Insight: a step is reachable iff some step exactly one jump below it is
// reachable. We open by naming the method (rather than asking a hard puzzle),
// then force the recurrence on a single step, then enact it on the full grid
// with dependency arrows and a real Check.
export const lesson1: Lesson = {
  id: 'reach-the-top',
  courseId: 'dynamic-programming',
  title: 'Can You Reach the Top?',
  order: 1,
  estimatedMinutes: 12,
  slides: [
    {
      id: 'l1-s1',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'A staircase you climb in jumps',
        body: 'You start on the ground (step 0). Every move climbs exactly 3 or 5 steps. The question we keep asking is simple: can you land exactly on a given step?',
        emphasis:
          'Guessing jump sequences is slow and error-prone. Instead we’ll build a method that proves reachability one step at a time — the foundation of dynamic programming.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'l1-s2',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'Step 7’s only launch pads are step 4 and step 2 (that’s 7 − 3 and 7 − 5). Both are unreachable. So is step 7 reachable?',
        options: [
          { id: 'reach', label: 'Reachable ✓' },
          { id: 'no', label: 'Not reachable ✗' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['no'] },
      hint: 'You can only arrive at a step by jumping from a reachable one. If both launch pads are dead, so is the step.',
      explanationOnWrong:
        'A step is only reachable if you can land on it from a reachable step. Step 7’s launch pads (4 and 2) are both ✗, so step 7 is ✗ too. Each step is decided entirely by its predecessors — that’s the state.',
    },
    {
      id: 'l1-s3',
      type: 'checkpoint',
      component: 'StairGrid',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 11,
        editable: true,
        showArrows: true,
        prompt:
          'Mark every step from 0 to 11. Tap a step to see the arrows from its launch pads — a step is reachable only if the step 3 or 5 below it is reachable.',
      },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 11, target: 11 },
      hint: 'A step is ✓ only if (step − 3) or (step − 5) is itself ✓. Start from step 0, which is always ✓.',
      explanationOnWrong:
        'Not quite. Start at step 0 (always ✓) and work upward: each step is ✓ only when step − 3 or step − 5 is ✓.',
    },
    {
      id: 'l1-s4',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'You just did dynamic programming',
        body: 'Instead of replaying every jump from the ground, you built each answer from smaller answers you already trusted.',
        emphasis:
          'To know if step 11 is reachable, you only need steps 8 and 6 — that’s 11 − 3 and 11 − 5.',
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
      id: 'l1-s5',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'This is bottom-up thinking',
        body: 'Determine the next state from the previous ones. Now, let’s translate this to programming.',
      },
      validation: { type: 'none' },
    },
  ],
};
