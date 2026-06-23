import type { Lesson } from '../../types/content';

// Lesson 1 — Reachability discovered bottom-up (jumps of 3 or 5, target 11).
// Insight: a step is reachable iff some step exactly one jump below it is
// reachable. The single-cell prompt (slide 3) forces that recurrence — it can't
// be answered by simulating paths, only by reading predecessors.
export const lesson1: Lesson = {
  id: 'reach-the-top',
  courseId: 'dynamic-programming',
  title: 'Can You Reach the Top?',
  order: 1,
  estimatedMinutes: 13,
  slides: [
    {
      id: 'l1-s1',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          "You're on the ground (step 0). Each move climbs exactly 3 or 5 steps. Can you land exactly on step 11?",
        options: [
          { id: 'yes', label: 'Yes, it can be done' },
          { id: 'no', label: 'No, 11 is impossible' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['yes'] },
      hint: 'Try stacking a few jumps: what is 3 + 3 + 5?',
      explanationOnWrong:
        'Actually you can: 3 + 3 + 5 = 11. Let’s discover why, one step at a time.',
    },
    {
      id: 'l1-s2',
      type: 'explore',
      component: 'StairGrid',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 11,
        editable: true,
        prompt:
          'Tap any step. Only two lower steps glow — the ones a single 3- or 5-jump below it. Those are the only steps that decide it.',
      },
      validation: { type: 'none' },
      hint: 'Step 0 is free — you start there. From any reachable step you can go +3 or +5.',
    },
    {
      id: 'l1-s3',
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
        'A step is only reachable if you can land on it from a reachable step. Step 7’s launch pads (4 and 2) are both ✗, so step 7 is ✗ too.',
    },
    {
      id: 'l1-s4',
      type: 'checkpoint',
      component: 'StairGrid',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 11,
        editable: true,
        prompt:
          'Now mark every step from 0 to 11. Work upward — each step depends only on the two below it.',
      },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 11, target: 11 },
      hint: 'A step is ✓ only if (step − 3) or (step − 5) is itself ✓.',
      explanationOnWrong:
        'Not quite. Start at step 0 (always ✓) and work upward: each step is ✓ only when step − 3 or step − 5 is ✓.',
    },
    {
      id: 'l1-s5',
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
      id: 'l1-s6',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'Bottom-up thinking unlocked',
        body: 'You reached the top by trusting the smaller steps. Next, we’ll give that staircase a memory.',
      },
      validation: { type: 'none' },
    },
  ],
};
