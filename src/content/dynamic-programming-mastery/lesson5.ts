import type { Lesson } from '../../types/content';

// Lesson 5 — Coin change (feasibility), the staircase in disguise.
// Teacher first works a small can_make[] array, then the learner fills the full
// one, then completes the (identical-shaped) tabulation loop.
export const lesson5: Lesson = {
  id: 'coin-change',
  courseId: 'dynamic-programming-mastery',
  title: 'Making Change',
  order: 5,
  estimatedMinutes: 10,
  slides: [
    {
      id: 'm5-s1',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'A classic problem: making change',
        body: 'Coin change is one of the most well-known problems in computer science: given a set of coin values, can you combine them to make a target amount exactly?',
        emphasis:
          'It looks brand new, but it maps cleanly onto the staircase. Each coin is just another way to step toward the total, and asking whether an amount can be made is the same as asking whether a step can be reached.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm5-s2',
      type: 'explain',
      component: 'ArrayRow',
      props: {
        steps: 6,
        jumpSizes: [3, 5],
        editable: false,
        showSolution: true,
        display: 'binary',
        name: 'can_make[]',
        highlightIndices: [3, 5, 6],
        prompt:
          'Watch me build can_make[] for coins {3, 5}, just like the stairs.\ncan_make[0] = 1 — you can always make 0 with no coins.\ncan_make[3] = 1 (one 3-coin); can_make[5] = 1 (one 5-coin).\ncan_make[6]: 6 − 3 = 3 is makeable → can_make[6] = 1. Amounts 1, 2, 4 can’t be reached → 0.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm5-s3',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'Coins are {3, 5} and you want to make 11. Which earlier amounts decide whether 11 is makeable?',
        options: [
          { id: 'sixeight', label: '6 and 8 — that’s 11 − 5 and 11 − 3' },
          { id: 'threefive', label: '3 and 5 — the coin values themselves' },
          { id: 'tenfive', label: '10 and 5' },
          { id: 'all', label: 'Every amount from 0 to 10' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['sixeight'] },
      hint: 'Subtract each coin from 11, just like subtracting a jump from a step.',
      explanationOnWrong:
        'Identical to the stairs: 11 − 3 = 8 and 11 − 5 = 6. If either of those amounts is makeable, so is 11.',
    },
    {
      id: 'm5-s4',
      type: 'checkpoint',
      component: 'ArrayRow',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 11,
        editable: true,
        display: 'binary',
        name: 'can_make[]',
        prompt:
          'Your turn — fill `can_make[]` for coins {3, 5}, amounts 0 to 11.\nStart from can_make[0] = 1, then for each amount set it to 1 if `amount − 3` or `amount − 5` is makeable. Tap a cell to set 1, tap again for 0.',
      },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 11, target: 11 },
      hint: 'can_make[0] = 1 (make nothing with no coins). Then each amount reads can_make[amount − 3] and can_make[amount − 5].',
      explanationOnWrong:
        'Work left to right: an amount is makeable only if (amount − 3) or (amount − 5) is makeable. It’s the same table you built for the stairs.',
    },
    {
      id: 'm5-s5',
      type: 'checkpoint',
      component: 'CodeBlanks',
      props: {
        prompt:
          'Same loop, new names. Complete the coin-change tabulation by filling the blanks.\nNote: `can_make[0] = True` because you can always make 0 cents — with no coins at all.',
        codeLines: [
          [{ type: 'text', value: 'can_make = [False] * (amount + 1)' }],
          [
            { type: 'text', value: 'can_make[' },
            { type: 'blank', id: 'ground' },
            { type: 'text', value: '] = True' },
          ],
          [{ type: 'text', value: 'for value in range(1, amount + 1):' }],
          [{ type: 'text', value: '    for coin in coins:' }],
          [
            { type: 'text', value: '        if value - coin >= 0 and can_make[' },
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
          { id: 'vminusc', label: 'value - coin' },
          { id: 'value', label: 'value' },
          { id: 'coin', label: 'coin' },
          { id: 'vplusc', label: 'value + coin' },
          { id: 'amount', label: 'amount' },
        ],
      },
      validation: {
        type: 'codeBlanks',
        correct: { ground: 'zero', lookback: 'vminusc', current: 'value' },
      },
      hint: 'Compare to the reachability loop: coin plays the role of jump, value plays the role of i.',
      explanationOnWrong:
        'can_make[0] is True. You read the smaller amount can_make[value − coin], and when it’s makeable you set can_make[value] = True.',
    },
    {
      id: 'm5-s6',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'Same pattern, new problem',
        body: 'Coin change was reachable all along. But “can you?” is only half the story — next we’ll ask the harder question every real problem cares about: what’s the *best* you can do?',
      },
      validation: { type: 'none' },
    },
  ],
};
