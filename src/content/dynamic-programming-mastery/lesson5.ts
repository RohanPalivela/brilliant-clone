import type { Lesson } from '../../types/content';

// Lesson 5 — Coin change (feasibility), the staircase in disguise.
// The learner first builds the target amount by hand (a construction mechanic,
// not a grid fill), then the teacher works a small can_make[] array, an MCQ
// surfaces the look-back, the learner pins down one cell's predecessors and sees
// they're the exact cells the staircase used, before completing the loop.
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
        bodyFirst: true,
      },
      validation: { type: 'none' },
    },
    {
      id: 'm5-s1b',
      type: 'checkpoint',
      component: 'CoinBuilder',
      props: {
        coins: [3, 5],
        target: 11,
        prompt:
          'First, just play with it. With only 3- and 5-cent coins, can you make exactly 11? Tap coins to drop them in; tap a coin in your tray to take it back. Overshoot and you’ll need to rethink the mix.',
        caption:
          'Feasibility by hand: combine the coins to hit the target exactly. In a moment we’ll let an array answer this for every amount at once.',
      },
      validation: { type: 'coinSum', coins: [3, 5], target: 11 },
      hint: 'You have 3s and 5s. Three coins do it — mix the two sizes so they sum to 11.',
      explanationOnWrong:
        'Make 11 exactly from {3, 5}: 3 + 3 + 5 = 11. Drop coins until the total reads 11, with no overshoot.',
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
      component: 'PredecessorPicker',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 9,
        variant: 'array',
        name: 'can_make[]',
        moveLabel: 'coins',
        prompt:
          'Don’t fill a whole new table — you’ve done that for {3, 5} already. Just prove it’s the same machine: tap the amounts that `can_make[9]` reads, given coins {3, 5}. Amount 9 shows a “?” because you’re choosing what it depends on.',
        caption:
          'These are the exact same cells you tapped for `reachable[9]` on the staircase — a coin is just a jump, an amount is just a step.',
      },
      validation: { type: 'range', correctIndices: [4, 6] },
      hint: 'Subtract each coin from 9: 9 − 3 and 9 − 5. Tap those two amounts.',
      explanationOnWrong:
        'can_make[9] reads 9 − 3 = 6 and 9 − 5 = 4 — not the coin values 3 and 5, and never amounts above 9. It’s the staircase look-back with new names.',
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
