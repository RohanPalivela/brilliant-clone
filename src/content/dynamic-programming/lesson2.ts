import type { Lesson } from '../../types/content';

// Lesson 2 — Map the staircase onto a boolean array reachable[].
// Insight: that bottom-up reasoning *is* a table you fill once, left to right,
// reusing earlier cells. Cells render as a 0/1 bit array with [index] labels so
// it reads like code. The first interactive slide hands the learner a table
// already solved and locked through index 6, so finishing it enacts "compute
// once, reuse" instead of re-deriving the same map.
export const lesson2: Lesson = {
  id: 'stairs-to-arrays',
  courseId: 'dynamic-programming',
  title: 'From Stairs to Arrays',
  order: 2,
  estimatedMinutes: 10,
  slides: [
    {
      id: 'l2-s1',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Give the staircase a memory',
        body: 'Lay the steps flat into a row of cells. Each index is a height, and each cell stores one bit: 1 if that height is reachable, 0 if not.',
        emphasis: 'reachable[i] = 1 (reachable) or 0 (not). The index is the height.',
        visual: {
          component: 'ArrayRow',
          steps: 11,
          jumpSizes: [3, 5],
          display: 'binary',
        },
      },
      validation: { type: 'none' },
    },
    {
      id: 'l2-s2',
      type: 'prompt',
      component: 'ArrayRow',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 11,
        editable: true,
        prefillUpTo: 6,
        display: 'binary',
        prompt:
          'reachable[0..6] is already filled in for you. Finish reachable[7..11] using only earlier cells — tap a cell to flip it to 1, again for 0. You never re-trace from the ground.',
      },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 11, target: 11 },
      hint: 'For each remaining cell i, just read reachable[i − 3] and reachable[i − 5]. If either is 1, cell i is 1.',
      explanationOnWrong:
        'Check each new cell against its two predecessors: i − 3 and i − 5. The earlier cells are already correct — reuse them, don’t recompute.',
    },
    {
      id: 'l2-s3',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: {
        question:
          'The slow way re-traces every jump sequence from 0. What does the filled table let you skip?',
        options: [
          { id: 'reuse', label: 'Re-computing answers you already wrote down' },
          { id: 'jumps', label: 'Choosing which jump sizes are allowed' },
          { id: 'start', label: 'Marking index 0 as reachable' },
          { id: 'nothing', label: 'Nothing — it’s the same amount of work' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['reuse'] },
      hint: 'Once reachable[6] is written down, how many times do you need to figure it out again?',
      explanationOnWrong:
        'Each cell is computed once and then reused. The table saves you from re-deriving answers you already have — that reuse is the whole point of tabulation.',
    },
    {
      id: 'l2-s4',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'The recurrence in plain words',
        body: 'Every cell is decided by the same rule, applied left to right, reading only a couple of earlier cells.',
        emphasis: 'reachable[i] = reachable[i − 3] OR reachable[i − 5]  (when those indices exist)',
        visual: {
          component: 'ArrayRow',
          steps: 11,
          jumpSizes: [3, 5],
          highlightIndices: [6, 8, 11],
          display: 'binary',
        },
      },
      validation: { type: 'none' },
    },
  ],
};
