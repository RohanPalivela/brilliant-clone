import type { CoinSumParams, MinChoiceParams } from '../reviewBuilders';

// Coin-sum problems. Targets are hand-verified reachable from their coin sets.
// `fewest: true` adds the min-coins optimization (greedy-biggest is deliberately
// suboptimal on several of these). Plain problems accept any exact-sum combo.
export const coinProblems: CoinSumParams[] = [
  {
    id: 'rb-coin-vending-1-3-4-9',
    coins: [1, 3, 4],
    target: 9,
    prompt:
      'A vending machine accepts 1, 3, and 4 credit tokens. Tap tokens until the slot reads exactly 9 credits.',
    hint: 'Reach 9 by taking some smaller amount you already know how to build and dropping in one more token.',
    explanation:
      'Any mix of 1s, 3s, and 4s summing to 9 works here — for example 3+3+3, or 4+4+1. There is no "fewest" requirement, so every exact-9 combination is accepted.',
  },
  {
    id: 'rb-coin-till-1-3-4-6',
    coins: [1, 3, 4],
    target: 6,
    fewest: true,
    prompt:
      'You are making 6 cents of change at a till using 1, 3, and 4 cent coins. Use as FEW coins as possible.',
    hint: 'Think of best[6] as 1 + best[6 − coin]. Try peeling off a 3 and see what is left.',
    explanation:
      'Grabbing the biggest coin first gives 4+1+1 = 3 coins, but the optimum is 3+3 = 2 coins. The fewest-coins answer comes from comparing every first coin, not just the largest.',
  },
  {
    id: 'rb-coin-toll-1-4-5-8',
    coins: [1, 4, 5],
    target: 8,
    fewest: true,
    prompt:
      'A highway toll costs 8 and your purse holds 1, 4, and 5 value coins. Pay it in the fewest coins.',
    hint: 'Build 8 from a smaller already-solved amount plus one coin; the largest coin is not always the right peel.',
    explanation:
      'Greedy takes 5 first, leaving 3 to cover as 1+1+1, for 5+1+1+1 = 4 coins. The optimum is 4+4 = 2 coins. best[8] = min over coins of 1 + best[8 − coin] picks the 4.',
  },
  {
    id: 'rb-coin-chips-2-5-9',
    coins: [2, 5],
    target: 9,
    prompt:
      'At the casino you stack 2 and 5 value chips. Build a pile worth exactly 9.',
    hint: 'Start from a smaller pile you can already make and add one more chip to land on 9.',
    explanation:
      'With only 2s and 5s, 9 = 2+2+5. There is no 1 chip, so you must check reachability: one 5 plus two 2s lands exactly on 9.',
  },
  {
    id: 'rb-coin-arcade-1-5-6-10',
    coins: [1, 5, 6],
    target: 10,
    fewest: true,
    prompt:
      'An arcade dispenses 1, 5, and 6 value tickets. Reach exactly 10 tickets using as few as possible.',
    hint: 'Compare 1 + best[10 − coin] across your coins instead of always grabbing the biggest.',
    explanation:
      'Greedy grabs 6 first, then 1+1+1+1, giving 5 coins. The optimum is 5+5 = 2 coins. Always solving best[10 − coin] for every coin reveals the 5 beats the 6.',
  },
  {
    id: 'rb-coin-bridge-3-5-11',
    coins: [3, 5],
    target: 11,
    fewest: true,
    prompt:
      'A footbridge turnstile takes only 3 and 5 value coins. Pay exactly 11 in the fewest coins.',
    hint: 'There is no 1 coin, so test which first coin leaves a remainder you can finish: try 11 − 5 and 11 − 3.',
    explanation:
      'The only way to make 11 from 3s and 5s is 3+3+5 = 3 coins, so that is also the fewest. Picking the 5 first leaves 6 = 3+3, which closes out exactly.',
  },
  {
    id: 'rb-coin-laundry-2-5-14',
    coins: [2, 5],
    target: 14,
    prompt:
      'A laundromat changer holds 2 and 5 value coins. Build exactly 14 to start a wash.',
    hint: 'Grow toward 14 from a smaller reachable total by adding one coin at a time.',
    explanation:
      'Using 2s and 5s, 14 = 2+2+5+5 (and also 2+2+2+2+2+2+2). Any exact-14 combination is accepted since there is no fewest requirement.',
  },
];

// Optimal-first-choice problems. The app computes the correct first coin via
// best[amount] = min over coins of 1 + best[amount − coin]; we only supply
// coins + amount + prose. Every one of these is a greedy-biggest trap.
export const minChoiceProblems: MinChoiceParams[] = [
  {
    id: 'rb-min-1-3-4-6',
    coins: [1, 3, 4],
    amount: 6,
    prompt:
      'You owe 6 and may pay with 1, 3, and 4 coins. Which single FIRST coin starts the fewest-coins solution?',
    hint: 'For each coin c, compare 1 + best[6 − c]; pick the coin that minimizes it.',
    explanation:
      'Starting with 4 forces 4+1+1 = 3 coins. Starting with 3 gives 3+3 = 2 coins, the minimum. The best first coin is 3, even though 4 is larger.',
  },
  {
    id: 'rb-min-1-4-5-8',
    coins: [1, 4, 5],
    amount: 8,
    prompt:
      'A cashier must give 8 in change using 1, 4, and 5 coins. Pick the best first coin to drop.',
    hint: 'Evaluate 1 + best[8 − c] for c = 1, 4, 5 and choose the smallest result.',
    explanation:
      'Choosing 5 first leaves 3 = 1+1+1, totalling 4 coins. Choosing 4 first gives 4+4 = 2 coins. So 4 is the optimal first coin, not the bigger 5.',
  },
  {
    id: 'rb-min-1-5-6-10',
    coins: [1, 5, 6],
    amount: 10,
    prompt:
      'A toll booth needs 10 paid from 1, 5, and 6 coins. Which first coin leads to the fewest total coins?',
    hint: 'Compare 1 + best[10 − c] across the coins rather than reaching for the largest.',
    explanation:
      'Picking 6 first strands you with 4 = 1+1+1+1, for 5 coins overall. Picking 5 first gives 5+5 = 2 coins. The best first coin is 5.',
  },
  {
    id: 'rb-min-1-4-5-12',
    coins: [1, 4, 5],
    amount: 12,
    prompt:
      'You must hand over 12 using 1, 4, and 5 coins. Choose the smartest first coin.',
    hint: 'Solve 1 + best[12 − c] for each coin; the largest coin is a trap.',
    explanation:
      'Starting with 5 leaves 7 = 5+1+1, totalling 4 coins. Starting with 4 gives 4+4+4 = 3 coins. The optimal first coin is 4, beating the greedy 5.',
  },
  {
    id: 'rb-min-2-5-6',
    coins: [2, 5],
    amount: 6,
    prompt:
      'A parking meter accepts only 2 and 5 coins and needs exactly 6. Which first coin can actually finish the job?',
    hint: 'Check 1 + best[6 − c] for each coin — one choice leaves a remainder you can never complete.',
    explanation:
      'Grabbing the bigger 5 first leaves 1, which cannot be made from 2s and 5s — a dead end. Only 2 works: 2+2+2 = 3 coins, so 2 is the best (and only valid) first coin.',
  },
];
