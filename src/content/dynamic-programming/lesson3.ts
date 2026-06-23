import type { Lesson } from '../../types/content';

// Lesson 3 — Transfer the pattern to a new jump set (2, 3, or 4).
// Insight: to find the current state you must understand how you transition
// into it. With jumps 3 and 5 that was just two predecessors; with 2, 3, 4 the
// look-back is a contiguous *range* of previous states. The method is identical
// — only the set of states you transition from changes.
export const lesson3: Lesson = {
  id: 'changing-the-rules',
  courseId: 'dynamic-programming',
  title: 'Changing the Rules',
  order: 3,
  estimatedMinutes: 9,
  slides: [
    {
      id: 'l3-s1',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'New rule: you may jump 2, 3, or 4 steps. To decide a step, how many earlier steps do you now look back at?',
        options: [
          { id: 'three', label: 'Three — one for each allowed jump (a range of states)' },
          { id: 'two', label: 'Still just two, like before' },
          { id: 'all', label: 'Every earlier step' },
          { id: 'none', label: 'None — we need a brand new method' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['three'] },
      hint: 'You can land on a step from any allowed jump below it. How many jumps are allowed now?',
      explanationOnWrong:
        'The method is unchanged: a step is reachable if any step one jump below it is. With jumps 2, 3, 4 that’s three predecessors — the transition now reads from a range of states.',
    },
    {
      id: 'l3-s2',
      type: 'checkpoint',
      component: 'RangeSelector',
      props: {
        min: 1,
        max: 7,
        target: 7,
        goalIndex: 7,
        jumpSizes: [2, 3, 4],
        prompt:
          'Step 7 is the goal (highlighted, not selectable). Set the window to exactly the earlier steps you transition from to decide it, with jumps of 2, 3, or 4.',
      },
      validation: { type: 'range', correctIndices: [3, 4, 5] },
      hint: 'F(7) depends on 7 − 2, 7 − 3, and 7 − 4.',
      explanationOnWrong:
        'Subtract each jump from 7: 7 − 4 = 3, 7 − 3 = 4, 7 − 2 = 5. The states you transition from are {3, 4, 5}.',
    },
    {
      id: 'l3-s3',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'One rule, any jump set',
        body: 'Finding a state is always the same job: look back at the states you can transition from, and reuse their answers. Before that was two cells; here it’s the range {3, 4, 5}.',
        emphasis:
          'For any step i, look back at i − j for every allowed jump j. Reachable if any of them is reachable.',
        visual: {
          component: 'StairGrid',
          steps: 7,
          jumpSizes: [2, 3, 4],
          highlightIndices: [3, 4, 5, 7],
        },
      },
      validation: { type: 'none' },
    },
  ],
};
