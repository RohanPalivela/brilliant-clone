import type { Slide } from '../../types/content';

// Hand-authored review problems for the two patterns whose answers are
// author-specified rather than engine-computed: "recurrence in code"
// (CodeBlanks) and "spotting the pattern" (MultipleChoice). Kept deliberately
// small and verified by hand. ids are prefixed 'rb-code-' / 'rb-mcq-'.

export const conceptProblems: Slide[] = [
  {
    id: 'rb-code-canmake',
    type: 'checkpoint',
    component: 'CodeBlanks',
    props: {
      prompt:
        'This is the coin-change feasibility sweep — the staircase reachability loop with coins as the jumps. Drag the right pieces into the blanks.',
      codeLines: [
        [{ type: 'text', value: 'can_make = [False] * (amount + 1)' }],
        [
          { type: 'text', value: 'can_make[' },
          { type: 'blank', id: 'ground' },
          { type: 'text', value: '] = True' },
        ],
        [{ type: 'text', value: 'for a in range(1, amount + 1):' }],
        [{ type: 'text', value: '    for c in coins:' }],
        [
          { type: 'text', value: '        if a - c >= 0 and can_make[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: ']:' },
        ],
        [
          { type: 'text', value: '            can_make[' },
          { type: 'blank', id: 'current' },
          { type: 'text', value: '] = True' },
        ],
      ],
      tokens: [
        { id: 'zero', label: '0' },
        { id: 'aminusc', label: 'a - c' },
        { id: 'a', label: 'a' },
        { id: 'c', label: 'c' },
        { id: 'amount', label: 'amount' },
        { id: 'aplusc', label: 'a + c' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { ground: 'zero', lookback: 'aminusc', current: 'a' },
    },
    hint: 'Amount 0 is always makeable (use no coins). An amount a is makeable if some smaller already-solved amount a − c is.',
    explanationOnWrong:
      'Seed can_make[0] = True (zero needs no coins). Then a is makeable when the earlier amount a − c is makeable, so you read can_make[a − c] and set can_make[a].',
  },
  {
    id: 'rb-code-countways',
    type: 'checkpoint',
    component: 'CodeBlanks',
    props: {
      prompt:
        'Counting ways up a staircase uses the SAME table shape as reachability — but the combine step adds instead of OR-ing. Fill the blanks.',
      codeLines: [
        [{ type: 'text', value: 'ways = [0] * (n + 1)' }],
        [
          { type: 'text', value: 'ways[0] = ' },
          { type: 'blank', id: 'seed' },
        ],
        [{ type: 'text', value: 'for i in range(1, n + 1):' }],
        [{ type: 'text', value: '    for s in steps:' }],
        [
          { type: 'text', value: '        if i - s >= 0:' },
        ],
        [
          { type: 'text', value: '            ways[i] += ways[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: ']' },
        ],
      ],
      tokens: [
        { id: 'one', label: '1' },
        { id: 'zero', label: '0' },
        { id: 'iminuss', label: 'i - s' },
        { id: 'ipluss', label: 'i + s' },
        { id: 'i', label: 'i' },
        { id: 's', label: 's' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { seed: 'one', lookback: 'iminuss' },
    },
    hint: 'There is exactly one way to stand at the bottom (do nothing), so ways[0] = 1. Each way to reach i comes from a way to reach an earlier i − s.',
    explanationOnWrong:
      'Seed ways[0] = 1 (a single empty way), not 0 — seeding 0 makes every count stay 0. Then sum the ways from each predecessor i − s into ways[i]. Same look-backs as reachability; the combine step is + instead of OR.',
  },
  {
    id: 'rb-code-mincoins',
    type: 'checkpoint',
    component: 'CodeBlanks',
    props: {
      prompt:
        'The fewest-coins table: each amount takes one coin on top of the best smaller subproblem. Complete the recurrence.',
      codeLines: [
        [{ type: 'text', value: 'best = [INF] * (amount + 1)' }],
        [
          { type: 'text', value: 'best[0] = ' },
          { type: 'blank', id: 'seed' },
        ],
        [{ type: 'text', value: 'for a in range(1, amount + 1):' }],
        [{ type: 'text', value: '    for c in coins:' }],
        [
          { type: 'text', value: '        if a - c >= 0:' },
        ],
        [
          { type: 'text', value: '            best[a] = min(best[a], ' },
          { type: 'blank', id: 'plus' },
          { type: 'text', value: ' + best[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: '])' },
        ],
      ],
      tokens: [
        { id: 'zero', label: '0' },
        { id: 'one', label: '1' },
        { id: 'aminusc', label: 'a - c' },
        { id: 'aplusc', label: 'a + c' },
        { id: 'c', label: 'c' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { seed: 'zero', plus: 'one', lookback: 'aminusc' },
    },
    hint: 'It takes 0 coins to make amount 0. To make a, you spend 1 coin to drop from an earlier amount a − c.',
    explanationOnWrong:
      'Seed best[0] = 0. Each coin you lay down adds 1 to the cost of the subproblem a − c, so best[a] = min(best[a], 1 + best[a − c]).',
  },
  {
    id: 'rb-mcq-predecessors',
    type: 'checkpoint',
    component: 'MultipleChoice',
    props: {
      question:
        'In a reachability sweep with jumps {2, 5}, what does cell 9 depend on?',
      options: [
        { id: 'pred', label: 'Whether cell 7 (9−2) or cell 4 (9−5) is reachable' },
        { id: 'all', label: 'Whether every earlier cell is reachable' },
        { id: 'next', label: 'Whether cell 10 or 11 ahead is reachable' },
        { id: 'adjacent', label: 'Whether cell 8, directly below it, is reachable' },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['pred'] },
    hint: 'Subtract each jump from 9. A cell looks backward by exactly one jump, not at neighbours or the future.',
    explanationOnWrong:
      'A cell is reachable iff at least one of (cell − jump) is reachable. For cell 9 with jumps {2, 5} that means cell 7 or cell 4 — its predecessors — not all earlier cells, not the adjacent cell, and never a forward cell.',
  },
  {
    id: 'rb-mcq-combine',
    type: 'checkpoint',
    component: 'MultipleChoice',
    props: {
      question:
        'Reachability and counting-ways fill the same table from the same look-backs. What actually differs between them?',
      options: [
        { id: 'combine', label: 'The combine step: OR the predecessors vs SUM them' },
        { id: 'order', label: 'The order cells are filled in' },
        { id: 'lookbacks', label: 'Which predecessor cells each cell reads' },
        { id: 'base', label: 'Nothing — they are the exact same code' },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['combine'] },
    hint: 'Both read the same i − j cells in the same bottom-up order. Think about what they DO with those predecessors.',
    explanationOnWrong:
      'Same states, same look-backs, same order. Only the combine step changes: reachability ORs the predecessors (reachable if ANY is), while counting ways SUMS them (add the counts). Later, min/max appear for optimization.',
  },
  {
    id: 'rb-mcq-greedy',
    type: 'checkpoint',
    component: 'MultipleChoice',
    props: {
      question:
        'Making 6 from coins {1, 3, 4}, why does grabbing the largest coin first fail to give the fewest coins?',
      options: [
        { id: 'greedy', label: 'Greedy takes 4, then 1+1 (3 coins); 3+3 needs only 2' },
        { id: 'unreachable', label: '6 cannot be made from these coins at all' },
        { id: 'greedyok', label: 'It does not fail — 4+1+1 is already optimal' },
        { id: 'morecoins', label: 'Using bigger coins always needs more coins' },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['greedy'] },
    hint: 'Count the coins each approach uses. Compare taking the 4 first against leaning on the 3s.',
    explanationOnWrong:
      'Greedy grabs 4, leaving 2 to cover as 1+1 — three coins total. But 3+3 makes 6 in just two coins. The optimum comes from comparing 1 + best[6 − c] over every coin, not always taking the biggest.',
  },
];
