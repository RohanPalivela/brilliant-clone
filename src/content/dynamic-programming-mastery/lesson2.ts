import type { Lesson } from '../../types/content';

// Lesson 2 — Give the staircase a memory: map reachability onto a boolean
// array reachable[] (jumps {3, 5}, length 11). Bridge from lesson 1's promise →
// morph the stairs into a row → teacher works one cell → an MCQ surfaces the
// "subtract to find predecessors" insight → small guided rung → full checkpoint
// → animated DPTable → reuse recap → recurrence recap → tee up lesson 3.
export const lesson2: Lesson = {
  id: 'stairs-to-arrays',
  courseId: 'dynamic-programming-mastery',
  title: 'From Stairs to Arrays',
  order: 2,
  estimatedMinutes: 12,
  slides: [
    {
      id: 'm2-s0',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Give the staircase a memory',
        body: 'Last lesson ended with a promise: give the staircase a memory. Here it is. Instead of re-deciding a step every time a later step asks about it, you’ll write each answer down once — in an array — and just read it back.',
        emphasis:
          'reachable[i] stores the answer for step i: 1 if it can be reached, 0 if not. That array is the memory — fill each cell once, reuse it forever, and never recompute a step.',
        bodyFirst: true,
      },
      validation: { type: 'none' },
    },
    {
      id: 'm2-s1',
      type: 'explore',
      component: 'StairsToArray',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        prompt:
          'The staircase can be represented as an array. Watch each step lie down to become one box in a row: its height turns into its index, and the ✓/✗ turns into a single bit — 1 if that step is reachable, 0 if not.',
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
        showArrows: true,
        highlightIndices: [3, 5, 6],
        arrowTargets: [6],
        prompt:
          'Here’s how to fill one cell — and where every array starts.\nBase case: reachable[0] = 1. You start on the ground, so step 0 is always reachable.\nNow reachable[6]: you can only land on it from 6 − 3 = 3 or 6 − 5 = 1. If EITHER of those predecessors is 1, this cell is 1. Here reachable[3] = 1, so reachable[6] = 1.\nIn shorthand that same rule is written reachable[6] = reachable[3] || reachable[1] = 1 || 0 = 1.\nAnd reachable[1]: both 1 − 3 and 1 − 5 fall below index 0, so no jump can reach it — reachable[1] = 0.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm2-s2b',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'Jumps are {3, 5}. Before you can decide `reachable[8]`, which two cells do you read?',
        options: [
          { id: 'fivethree', label: '`reachable[5]` and `reachable[3]` — that’s 8 − 3 and 8 − 5' },
          { id: 'forward', label: '`reachable[11]` and `reachable[13]` — where a jump from 8 would land' },
          { id: 'adjacent', label: '`reachable[7]` and `reachable[6]` — the two cells right before 8' },
          { id: 'all', label: 'Every earlier cell, `reachable[0]` through `reachable[7]`' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['fivethree'] },
      hint: 'Subtract each jump from 8, exactly like subtracting a jump from a step. Which two indices do you land on?',
      explanationOnWrong:
        'Same look-back as the stairs: 8 − 3 = 5 and 8 − 5 = 3. If either reachable[5] or reachable[3] is 1, then reachable[8] is 1. You look backward (subtract a jump), never forward.',
    },
    {
      id: 'm2-s2c',
      type: 'checkpoint',
      component: 'ArrayRow',
      props: {
        steps: 6,
        jumpSizes: [3, 5],
        target: 6,
        editable: true,
        prefillUpTo: 0,
        display: 'binary',
        name: 'reachable[]',
        showArrows: true,
        prompt:
          'Warm up on a short row first. reachable[0] = 1 is already locked (you start on the ground). Fill reachable[1..6] yourself: for each cell i, read reachable[i − 3] and reachable[i − 5] — if either is 1, tap the cell to set it to 1; leave it 0 otherwise. The look-back arrows show you which two cells to check.',
      },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 6, target: 6 },
      hint: 'For each cell i, only two cells matter: reachable[i − 3] and reachable[i − 5]. If either is 1, so is cell i.',
      explanationOnWrong:
        'Work left to right from reachable[0] = 1. reachable[3] = 1 (3 − 3 = 0) and reachable[5] = 1 (5 − 5 = 0); reachable[6] = 1 because reachable[3] is. Cells 1, 2, 4 have no reachable predecessor, so they stay 0.',
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
        showArrows: true,
        prompt:
          'Now the full row. reachable[0..6] is already filled in for you. Finish reachable[7..11]: for each cell i, read reachable[i − 3] and reachable[i − 5] — if either is 1, this cell is 1. Tap a cell to set it to 1, tap again for 0. Never re-trace from the ground; just reuse the earlier cells.',
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
        display: 'binary',
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
        body: 'Every cell follows the same rule, applied left to right, reading only a couple of earlier cells: reachable[i] is 1 if reachable[i − 3] or reachable[i − 5] is. The arrows into reachable[11] show it reading just reachable[8] and reachable[6] — nothing else. One guard matters: when i − 3 or i − 5 dips below 0, that index doesn’t exist, so a cell with no valid predecessor simply stays 0 (that’s why reachable[1] and reachable[2] never light up).',
        emphasis: 'reachable[i] = reachable[i − 3] || reachable[i − 5]   (skip any index below 0)',
        visual: {
          component: 'ArrayRow',
          steps: 11,
          jumpSizes: [3, 5],
          highlightIndices: [6, 8, 11],
          showArrows: true,
          arrowTargets: [11],
          display: 'binary',
        },
      },
      validation: { type: 'none' },
    },
    {
      id: 'm2-s7',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'The array is the DP table',
        body: 'You gave the staircase a memory: reachable[] holds every answer, written once and reused in a single left-to-right sweep. That filled array *is* the dynamic-programming table. Next, same method, new jump sizes — we’ll swap {3, 5} for {2, 3, 4}, and the loop won’t care; all that changes is which earlier cells each step looks back at.',
      },
      validation: { type: 'none' },
    },
  ],
};
