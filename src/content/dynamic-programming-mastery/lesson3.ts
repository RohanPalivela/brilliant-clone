import type { Lesson } from '../../types/content';

// Lesson 3 — Transfer the pattern to a new jump set (2, 3, or 4).
// The method is identical; only the set of states you transition from changes.
// Teacher works out the predecessors of one step, then the learner does another.
export const lesson3: Lesson = {
  id: 'changing-the-rules',
  courseId: 'dynamic-programming-mastery',
  title: 'Changing the Rules',
  order: 3,
  estimatedMinutes: 9,
  slides: [
    {
      id: 'm3-s1',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Same method, new jumps',
        body: 'New rule: each move may climb 2, 3, or 4 steps. Nothing about our approach changes — a step is still reachable only if some step one jump below it is reachable.',
        emphasis:
          'All that changes is which earlier steps you look back at. Swap the jump set, keep the method.',
        bodyFirst: true,
      },
      validation: { type: 'none' },
    },
    {
      id: 'm3-s2',
      type: 'explain',
      component: 'StairGrid',
      props: {
        steps: 7,
        jumpSizes: [2, 3, 4],
        editable: false,
        showSolution: true,
        highlightIndices: [2, 3, 4, 6],
        prompt:
          'Watch which steps decide step 6 with jumps 2, 3, 4.\nYou could arrive at 6 from 6 − 2 = 4, from 6 − 3 = 3, or from 6 − 4 = 2.\nSo step 6 looks back at the range of steps {2, 3, 4} — three predecessors instead of two.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm3-s3',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'With jumps of 2, 3, or 4, how many earlier steps do you look back at to decide a step?',
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
      id: 'm3-s4',
      type: 'checkpoint',
      component: 'RangeSelector',
      props: {
        min: 1,
        max: 7,
        target: 7,
        goalIndex: 7,
        jumpSizes: [2, 3, 4],
        prompt:
          'Now you do step 7 (highlighted, not selectable). Drag the window to cover exactly the earlier steps you’d transition from to decide it, with jumps of size 2, 3, or 4.',
      },
      validation: { type: 'range', correctIndices: [3, 4, 5] },
      hint: 'Step 7 depends on 7 − 2, 7 − 3, and 7 − 4.',
      explanationOnWrong:
        'Subtract each jump from 7: 7 − 4 = 3, 7 − 3 = 4, 7 − 2 = 5. The states you transition from are {3, 4, 5}.',
    },
    {
      id: 'm3-s5',
      type: 'explore',
      component: 'DPTable',
      props: {
        mode: 'reachability',
        steps: 9,
        jumpSizes: [2, 3, 4],
        prompt:
          'Nothing about the algorithm changed — only the look-back distances. Watch the same sweep solve a different staircase, and notice which cells each step reads from.',
        caption: 'Swap the jump set and the same loop solves a new problem.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm3-s6',
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
