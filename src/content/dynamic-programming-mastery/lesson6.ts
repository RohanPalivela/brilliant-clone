import type { Lesson } from '../../types/content';

// Lesson 6 — From yes/no to "how many?". The jump from feasibility to
// optimization: cells stop storing a bit and start storing a *value* you
// minimize over choices. Greedy is shown to fail, the learner names the
// subproblems, then the teacher works minCoins[6] by hand before the table/code.
export const lesson6: Lesson = {
  id: 'fewest-coins',
  courseId: 'dynamic-programming-mastery',
  title: 'Fewest Coins',
  order: 6,
  estimatedMinutes: 12,
  slides: [
    {
      id: 'm6-s1',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Yes or no isn’t enough',
        body: 'A vending machine doesn’t just need to make 6 cents — it wants to use as few coins as possible. The cells stop storing a bit (makeable?) and start storing a number: the fewest coins needed.',
        emphasis:
          'This is the leap from feasibility to optimization — the kind of question most real DP problems actually ask.',
        bodyFirst: true,
      },
      validation: { type: 'none' },
    },
    {
      id: 'm6-s2',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'Coins are {1, 3, 4} and you want to make 6. The greedy rule grabs the biggest coin first: 4, then 1, then 1 — that’s 3 coins. Is that really the fewest?',
        options: [
          { id: 'greedy', label: 'Yes, 3 coins is best' },
          { id: 'two', label: 'No — 3 + 3 makes 6 with just 2 coins' },
          { id: 'four', label: 'No — it actually takes 4 coins' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['two'] },
      hint: 'Try ignoring the biggest coin. Is there a pair of coins that sums to 6?',
      explanationOnWrong:
        'Greedy grabs 4 + 1 + 1 = 3 coins, but 3 + 3 = 6 uses only 2. Grabbing the biggest coin first is not always optimal — so we need DP, not greed.',
    },
    {
      id: 'm6-s3',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: {
        question:
          'To find the fewest coins for 6 with coins {1, 3, 4}, which smaller amounts do you compare? (Take 1 coin, then reuse the best answer for what’s left.)',
        options: [
          { id: 'right', label: 'minCoins[5], minCoins[3], and minCoins[2] — that’s 6 − 1, 6 − 3, 6 − 4' },
          { id: 'coins', label: 'Just the coin values 1, 3, and 4' },
          { id: 'all', label: 'Every amount from 0 to 5' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['right'] },
      hint: 'Subtract each coin from 6. Each choice leaves a smaller amount whose best answer you already know.',
      explanationOnWrong:
        'Take one coin c, and you’re left needing 6 − c. So you compare minCoins[6 − 1], minCoins[6 − 3], minCoins[6 − 4] and add 1 to the smallest.',
    },
    {
      id: 'm6-s4',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Work out minCoins[6] by hand',
        body: 'Each choice takes one coin now and reuses the best answer for what’s left. Try all three, then keep the smallest.',
        bullets: [
          'Take a 1 → 1 + minCoins[5]. Since minCoins[5] = 2, that’s 3 coins.',
          'Take a 3 → 1 + minCoins[3]. Since minCoins[3] = 1, that’s 2 coins.',
          'Take a 4 → 1 + minCoins[2]. Since minCoins[2] = 2, that’s 3 coins.',
        ],
        emphasis: 'Keep the smallest: minCoins[6] = 2 coins (3 + 3). DP beats greedy.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm6-s5',
      type: 'explore',
      component: 'DPTable',
      props: {
        mode: 'coins',
        coins: [1, 3, 4],
        amount: 6,
        prompt:
          'Same left-to-right sweep — but now each cell keeps the minimum over its choices instead of an OR. Watch minCoins fill, taking the best (smallest) option at each amount.',
        caption: 'The answer for 6 lands on 2 coins (3 + 3), beating greedy.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm6-s6',
      type: 'checkpoint',
      component: 'CodeBlanks',
      props: {
        prompt:
          'Now turn it into a loop. The only real change from reachability is OR → min (and storing a count).\nStart from `best[0] = 0`: zero coins make zero.',
        codeLines: [
          [{ type: 'text', value: 'best = [INF] * (amount + 1)' }],
          [
            { type: 'text', value: 'best[' },
            { type: 'blank', id: 'ground' },
            { type: 'text', value: '] = 0' },
          ],
          [{ type: 'text', value: 'for a in range(1, amount + 1):' }],
          [{ type: 'text', value: '    for c in coins:' }],
          [{ type: 'text', value: '        if a - c >= 0:' }],
          [
            { type: 'text', value: '            best[a] = min(best[a], ' },
            { type: 'blank', id: 'addend' },
            { type: 'text', value: ' + best[a - ' },
            { type: 'blank', id: 'coin' },
            { type: 'text', value: '])' },
          ],
        ],
        tokens: [
          { id: 'zero', label: '0' },
          { id: 'one', label: '1' },
          { id: 'a', label: 'a' },
          { id: 'c', label: 'c' },
          { id: 'aminusc', label: 'a - c' },
        ],
      },
      validation: {
        type: 'codeBlanks',
        correct: { ground: 'zero', addend: 'one', coin: 'c' },
      },
      hint: 'best[0] = 0. Taking coin c costs 1 coin plus the best way to make the leftover a − c.',
      explanationOnWrong:
        'best[0] = 0 (no coins make 0). Each coin c adds 1 coin to the best answer for a − c, and you keep the minimum.',
    },
    {
      id: 'm6-s7',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'You optimized, not just checked',
        body: 'Swapping OR for min turned a yes/no table into a best-value table. Same DP move as before — define the state, build each answer from smaller answers, fill the table once — but now you’re optimizing instead of just checking.',
      },
      validation: { type: 'none' },
    },
  ],
};
