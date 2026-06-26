import type { Lesson } from '../../types/content';

// Lesson 2 — Give the staircase a memory: map reachability onto a boolean
// array reachable[] (jumps {3, 5}, length 11). Bridge from lesson 1's promise →
// morph the stairs into a row → teacher works one cell → an MCQ surfaces the
// "subtract to find predecessors" insight → a predecessor-pick makes the learner
// isolate one cell's look-backs by hand (the recurrence, not another grid fill) →
// the full table-extension checkpoint (compute-once / reuse) → animated DPTable →
// reuse recap → recurrence recap → tee up lesson 3.
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
      hint: 'A cell becomes 1 only because a jump landed on it, so look backward, not forward. Subtract each jump from 8 — which two indices does that point to?',
      explanationOnWrong:
        'These are not the neighbours 7 and 6, and not where a jump from 8 would send you (11 and 13) — a cell is decided by where you jumped from, never where you could go next. Subtract each jump from 8 to find the two earlier cells you read; if either is 1, then reachable[8] is 1.',
    },
    {
      id: 'm2-s2c',
      type: 'checkpoint',
      component: 'PredecessorPicker',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 9,
        variant: 'array',
        prompt:
          'Before filling a whole row, pin down where one cell looks. Tap the cells that `reachable[9]` reads — the ones a single 3- or 5-jump below it. Cell 9 shows a “?” because you’re choosing what it depends on, not its value.',
        caption:
          'With jumps {3, 5} the two cells you read aren’t neighbors — they’re scattered. That’s the recurrence: subtract a jump, never scan forward.',
      },
      validation: { type: 'range', correctIndices: [4, 6] },
      hint: 'reachable[9] can only be set by a jump that lands on 9. Subtract each jump from 9 and tap the two earlier cells you would have jumped from.',
      explanationOnWrong:
        'Two common slips: tapping the jump sizes 3 and 5 instead of the cells you would jump from, or tapping cells above 9. A jump has to land on 9, so the cells it reads are 9 minus each jump — work those out and tap exactly those two.',
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
      hint: 'Take the cells in order. For each one, read reachable[i − 3] and reachable[i − 5] — if either is 1, cell i is 1. You only ever look two and four cells back.',
      explanationOnWrong:
        'For any cell that is off, name its two predecessors — i − 3 and i − 5 — and read their values: cell i is 1 if either is 1, otherwise 0. The cells 0–6 are already filled and correct, so reuse them instead of re-tracing jumps from the ground.',
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
      hint: 'Once you have written reachable[6] into the array, how many times do you ever have to figure it out again?',
      explanationOnWrong:
        'You still need the jump sizes and the base case at index 0, and the array is clearly less work, not the same — so those answers do not fit. The thing it lets you skip is recomputation: once a cell is written down, every later cell just reads it instead of re-deriving it from scratch.',
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
