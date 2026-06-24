import type { Lesson } from '../../types/content';

// Lesson 2 — Map the staircase onto a boolean array reachable[].
// Opens with an animated morph (stairs lie down into a row of boxes), then the
// teacher works one cell, then the learner finishes the array, then an animated
// DPTable shows the bit array filling left-to-right.
export const lesson2: Lesson = {
  id: 'stairs-to-arrays',
  courseId: 'dynamic-programming-mastery',
  title: 'From Stairs to Arrays',
  order: 2,
  estimatedMinutes: 10,
  slides: [
    {
      id: 'm2-s1',
      type: 'explore',
      component: 'StairsToArray',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        prompt:
          'The staircase and an array are the same thing. Watch each step lie down to become one box in a row: its height turns into its index, and the ✓/✗ turns into a single bit — 1 if that step is reachable, 0 if not.',
        caption:
          'Same information, flatter shape. From here on we’ll store the answers in this row of cells: reachable[].',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm2-s2',
      type: 'explain',
      component: 'ArrayRow',
      props: {
        steps: 6,
        jumpSizes: [3, 5],
        editable: false,
        showSolution: true,
        display: 'binary',
        name: 'reachable[]',
        prompt:
          'Here’s how to fill one cell. Each index is a height; the cell stores 1 (reachable) or 0 (not).\nreachable[6]: read reachable[6 − 3] = reachable[3] = 1 → so reachable[6] = 1.\nreachable[1]: reachable[1 − 3] and reachable[1 − 5] are below index 0, so nothing reaches it → reachable[1] = 0.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm2-s3',
      type: 'checkpoint',
      component: 'ArrayRow',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 11,
        editable: true,
        prefillUpTo: 6,
        display: 'binary',
        name: 'reachable[]',
        prompt:
          'Your turn. reachable[0..6] is already filled in for you. Finish reachable[7..11]: for each cell i, read reachable[i − 3] and reachable[i − 5] — if either is 1, this cell is 1. Tap a cell to set it to 1, tap again for 0. Never re-trace from the ground; just reuse the earlier cells.',
      },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 11, target: 11 },
      hint: 'For each remaining cell i, just read reachable[i − 3] and reachable[i − 5]. If either is 1, cell i is 1.',
      explanationOnWrong:
        'Check each new cell against its two predecessors: i − 3 and i − 5. The earlier cells are already correct — reuse them, don’t recompute.',
    },
    {
      id: 'm2-s4',
      type: 'explore',
      component: 'DPTable',
      props: {
        mode: 'reachability',
        steps: 11,
        jumpSizes: [3, 5],
        prompt:
          'Once a cell is written, it’s never recomputed — later cells just read it, and that reuse is what makes this fast. Watch the same array fill in one left-to-right pass.',
        caption: 'The earlier answers are written down once and reused.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm2-s5',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: {
        question:
          'The slow way re-traces every jump sequence from 0. What does the filled array let you skip?',
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
        'Each cell is computed once and then reused. The array saves you from re-deriving answers you already have — that reuse is the whole point of tabulation.',
    },
    {
      id: 'm2-s6',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'The recurrence in plain words',
        body: 'Every cell is decided by the same rule, applied left to right, reading only a couple of earlier cells.',
        emphasis: 'reachable[i] = reachable[i-3] || reachable[i-5]   (when those indices exist)',
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
