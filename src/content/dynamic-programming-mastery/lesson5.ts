import type { Lesson } from '../../types/content';

// Lesson 5 — Coin change (feasibility), the staircase in disguise.
// One thread: the coin problem can be modeled exactly like the staircase. The
// learner builds the target by hand (construction, not a grid fill) → watches an
// animated can_make[] sweep fill bottom-up with coins as jumps and amounts as
// steps (CoinSweep) → an MCQ checks they can name the look-back → they complete
// the same loop in code → recap. See the model, write the code, recap.
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
        coins: [4, 5],
        target: 13,
        prompt:
          'First, just play with it. With only 4- and 5-cent coins, can you make exactly 13? Tap coins to drop them in; tap a coin in your tray to take it back. Overshoot and you’ll need to rethink the mix.',
        caption:
          'Feasibility by hand: combine the coins to hit the target exactly. In a moment we’ll let an array answer this for every amount at once.',
      },
      validation: { type: 'coinSum', coins: [4, 5], target: 13 },
      hint: 'You only have 4s and 5s, and it takes three coins. Try mixing the two sizes: if you drop one 5, how much is left to cover with 4s?',
      explanationOnWrong:
        'Aim for exactly 13 — overshooting means rethinking the mix. With three coins, figure out how many of each fit: if you use one 5, what amount is left, and does it split evenly into 4s? Adjust the count of each size until the tray reads 13 exactly.',
    },
    {
      id: 'm5-s1c',
      type: 'checkpoint',
      component: 'ArrayRow',
      props: {
        steps: 13,
        jumpSizes: [4, 5],
        target: 13,
        editable: true,
        showArrows: true,
        display: 'icon',
        name: 'can_make[]',
        prompt:
          'Before any animation does it for you, fill in can_make[] by hand. For every amount from 0 to 13, decide: can you make it exactly with 4s and 5s? Amount 0 is already ✓ (make it with no coins). Tap a cell once for ✓ if it’s makeable, again for ✗ if it isn’t — an amount is ✓ only when (amount − 4) or (amount − 5) is already ✓.',
      },
      validation: { type: 'reachability', jumpSizes: [4, 5], steps: 13, target: 13 },
      hint: 'It’s the staircase with coins as jumps: 4 and 5 are your look-backs. Sweep left to right, and for each amount check (amount − 4) and (amount − 5) — ✓ if either is already ✓.',
      explanationOnWrong:
        'Go left to right so each amount you need is already filled. For every amount read only (amount − 4) and (amount − 5): if either is ✓, this amount is ✓ too; if both fall below 0 or are ✗, it’s ✗. Re-check the small amounts first — 1, 2, 3, 6, 7 can’t be made from 4s and 5s, but 8, 9, and 10 can.',
    },
    {
      id: 'm5-s2',
      type: 'explore',
      component: 'CoinSweep',
      props: {
        coins: [4, 5],
        amount: 13,
        prompt:
          'You just filled that array by hand — now watch the same answer build for every amount at once. It fills left to right: each amount reads the cells one coin below it — exactly the i − j look-back from the staircase, with coins playing the part of jumps.',
        caption:
          'No new algorithm — the same bottom-up sweep you ran on the stairs, now spelled out in coins.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm5-s3',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'Coins are {4, 5} and you want to make 13. Which earlier amounts decide whether 13 is makeable?',
        options: [
          { id: 'eightnine', label: '8 and 9 — that’s 13 − 5 and 13 − 4' },
          { id: 'fourfive', label: '4 and 5 — the coin values themselves' },
          { id: 'twelvefive', label: '12 and 5' },
          { id: 'all', label: 'Every amount from 0 to 12' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['eightnine'] },
      hint: 'It works just like the staircase: subtract each coin from 13 to find the smaller amounts you would add that coin to.',
      explanationOnWrong:
        '13 becomes makeable only if you can add one coin to a smaller amount that is already makeable — so subtract each coin from 13 to find those amounts. Do not pick the coin values 4 and 5 themselves; those are how far you look back, not the amounts you check.',
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
      hint: 'It is the reachability loop with coins as jumps: coin plays the role of jump, value plays the role of i. Map each blank onto the version you already wrote.',
      explanationOnWrong:
        'Reason through each blank using the coins-as-jumps mapping. Which amount is always makeable with no coins at all — your base case? Which smaller amount do you read, the one a single coin below value? And which cell do you set True — the amount you just reached?',
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
