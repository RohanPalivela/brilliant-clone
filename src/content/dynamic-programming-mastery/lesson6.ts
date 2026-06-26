import type { Lesson } from '../../types/content';

// Lesson 6 — From yes/no to "how many?". The jump from feasibility to
// optimization: cells stop storing a bit and start storing a *value* you
// minimize over choices. We watch greedy fail, build the min-coins recurrence
// from two known subproblems, make the learner perform the argmin first-coin
// choice (MinChoicePicker), then run it as a table and a loop.
export const lesson6: Lesson = {
  id: 'fewest-coins',
  courseId: 'dynamic-programming-mastery',
  title: 'Fewest Coins',
  order: 6,
  estimatedMinutes: 13,
  slides: [
    {
      id: 'm6-s1',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Yes or no isn’t enough',
        body: 'Last lesson you asked whether an amount could be made at all. Now raise the stakes: make 6 cents using the fewest coins possible. Same coins, harder question — you’re no longer checking, you’re optimizing.',
        emphasis:
          'Optimization — the best way, not just a way — is exactly what dynamic programming is built to answer.',
        bodyFirst: true,
      },
      validation: { type: 'none' },
    },
    {
      id: 'm6-s1b',
      type: 'checkpoint',
      component: 'CoinBuilder',
      props: {
        coins: [1, 3, 4],
        target: 6,
        fewest: true,
        showFewest: true,
        prompt:
          'Try it yourself first. With coins {1, 3, 4}, make exactly 6 — but in as few coins as you can. The instinct is to grab the biggest coin that fits; go ahead and see where that lands you, then see if you can do better.',
        caption:
          'Hitting 6 is easy; hitting it in the fewest coins is the real puzzle. Notice that grabbing the biggest coin first doesn’t get you there.',
      },
      validation: { type: 'coinSum', coins: [1, 3, 4], target: 6, fewest: true },
      hint: 'Start with the biggest coin, 4, and you’re forced into 4 + 1 + 1 — three coins. What if you never touch the 4? Two of one coin might land exactly on 6.',
      explanationOnWrong:
        'You can reach 6 many ways, but only one uses the fewest coins. Grabbing the biggest coin (4) strands you on 4 + 1 + 1 = three coins. Skip it and look for two equal coins that sum to 6 — that two-coin answer is exactly why the greedy instinct fails, as you’re about to see.',
    },
    {
      id: 'm6-s2',
      type: 'explore',
      component: 'GreedyFailure',
      props: {
        coins: [1, 3, 4],
        amount: 6,
        greedyPick: [4, 1, 1],
        optimalPick: [3, 3],
        prompt:
          'The obvious idea is greedy: always grab the biggest coin that fits. With coins {1, 3, 4}, making 6 grabs a 4, then a 1, then a 1.\nWatch what that costs against the real best answer.',
        caption:
          'Greedy is fast but shortsighted — one early “biggest coin” locks you into a worse total. We need a method that considers every option.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm6-s3',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Lean on smaller answers',
        body: 'Step back and think in general. You have two coins, X and Y, and you want the fewest coins to make some value Z. The trick from the staircase still works: assume you’ve already solved every smaller amount.',
        bullets: [
          'Suppose you already know it takes 5 coins to make Z − X.',
          'And you know it takes 4 coins to make Z − Y.',
          'Any solution for Z must start by laying down one coin — either an X or a Y — and then making whatever is left.',
        ],
        emphasis:
          'So the only decision at Z is: which single coin do I add first? Each choice points back to a smaller amount you’ve already solved.',
        bodyFirst: true,
      },
      validation: { type: 'none' },
    },
    {
      id: 'm6-s4',
      type: 'explore',
      component: 'CoinRecurrence',
      props: {
        coinXLabel: 'X',
        coinYLabel: 'Y',
        costX: 5,
        costY: 4,
        prompt:
          'Take one coin, then reuse the best answer for the rest. Adding an X coin costs 1 + 5; adding a Y coin costs 1 + 4. Keep the cheaper route.',
        caption:
          'Add one coin to the better subproblem: minCoins(Z) = 1 + min(5, 4) = 5.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm6-s5',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'The recurrence',
        body: 'That single picture is the whole algorithm. For every coin you could lay down first, take 1 plus the best answer for the amount that remains, then keep the smallest result across all coins.',
        pseudocode:
          'minCoins(Z) = 1 + min( minCoins(Z − X), minCoins(Z − Y) )\nminCoins(0) = 0   # zero coins make zero',
        emphasis:
          'Base case minCoins(0) = 0 anchors it; every larger amount is built from smaller answers you already have. This is the move that beats greedy.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm6-s6',
      type: 'checkpoint',
      component: 'MinChoicePicker',
      props: {
        coins: [1, 3, 4],
        amount: 6,
        prompt:
          'Your turn to make 6 with {1, 3, 4}. Each card starts from the cheapest known way to make a smaller amount, then adds one coin to land on 6. Pick the coin whose total is smallest.',
        caption:
          'Each total = the coins already used for the smaller amount + 1 for the coin you add. Pick the smallest total.',
      },
      validation: { type: 'minCoinChoice', coins: [1, 3, 4], amount: 6 },
      hint: 'For each coin c, the cost is 1 (for that coin) plus best[6 − c]. Work out all three leftovers — 6 − 1, 6 − 3, 6 − 4 — and compare. The winner is not always the biggest coin.',
      explanationOnWrong:
        'Each card’s total is 1 for the coin you add now plus the best coins for what is left (6 minus that coin). Resist grabbing the biggest coin — that is the greedy trap you just saw fail. Compute all three totals and keep the smallest. Which leftover is cheapest to make: 6 − 1, 6 − 3, or 6 − 4?',
    },
    {
      id: 'm6-s7',
      type: 'explore',
      component: 'DPTable',
      props: {
        mode: 'coins',
        coins: [1, 3, 4],
        amount: 6,
        prompt:
          'Same left-to-right sweep as reachability — but now each cell keeps the minimum over its choices instead of an OR. Watch minCoins fill, taking 1 + the best smaller answer at every amount.',
        caption: 'The answer for 6 lands on 2 coins (3 + 3), beating greedy’s 3.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm6-s8',
      type: 'checkpoint',
      component: 'CodeBlanks',
      props: {
        prompt:
          'Now turn the recurrence into a loop. The only real change from reachability is OR → min (and storing a count).\nStart from `best[0] = 0`: zero coins make zero.',
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
      hint: 'Three blanks: the cost of making 0, the number of coins a single c adds, and the leftover amount you look up. The only change from reachability is OR becoming min.',
      explanationOnWrong:
        'Reason through each blank. What does it cost to make 0 — your base case? When you lay one coin c, how many coins does that single coin add (the addend)? And the leftover you then solve is a minus which value? Keep the minimum across every coin.',
    },
    {
      id: 'm6-s9',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'You optimized, not just checked',
        body: 'Swapping OR for min turned a yes/no table into a best-value table. Same DP move as ever — define the state, build each answer from smaller answers, fill the table once — but now you’re finding the best, not just the possible.',
      },
      validation: { type: 'none' },
    },
  ],
};
