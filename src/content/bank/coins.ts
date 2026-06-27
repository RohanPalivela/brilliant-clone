import type { CoinSumParams, MinChoiceParams } from '../reviewBuilders';

// Coin-sum problems. Targets are engine-verified reachable from their coin sets.
// `fewest: true` adds the min-coins optimization; the in-scope fewest problems
// here are greedy-largest overshoot TRAPS *with a 1-coin present* (exactly L6's
// shape). Plain (non-fewest) problems drop the 1 coin and use larger targets, so
// even reaching the target exactly is the puzzle (L5 feasibility).
//
// Difficulty (1–5) tracks target size, search tedium, and how badly greedy fails.
// Ordered ASCENDING. The lone no-1-coin stranding fewest problem
// (`rb-coin-parking-4-5-12`) sits last at difficulty 5: it is at the edge of the
// taught scope, so it is rated hardest and seeded last.
export const coinProblems: CoinSumParams[] = [
  {
    id: 'rb-coin-laundry-6-9-24',
    difficulty: 2,
    coins: [6, 9],
    target: 24,
    prompt:
      'A laundromat changer holds only 6 and 9 value coins. Build exactly 24 to start a wash.',
    hint: 'Both coins are multiples of 3, so 24 is reachable — try all-6s, or swap a pair of 6s for a pair of 9s.',
    explanation:
      'You can make 24 as 6+6+6+6 (four coins) or as 6+9+9 (three coins). There is no fewest requirement, so any exact-24 combination of 6s and 9s is accepted.',
  },
  {
    id: 'rb-coin-till-1-3-4-6',
    difficulty: 2,
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
    id: 'rb-coin-1-4-5-t8-fewest',
    difficulty: 2,
    coins: [1, 4, 5],
    target: 8,
    fewest: true,
    prompt:
      'You are making 8 cents of change using 1, 4, and 5 cent coins. Use as FEW coins as possible.',
    hint: 'Think of best[8] as 1 + best[8 − coin]. Peeling off a 4 leaves another 4.',
    explanation:
      'Grabbing the biggest coin first gives 5 + 1 + 1 + 1 = 4 coins, but the optimum is 4 + 4 = 2 coins. The fewest-coins answer compares every first coin (and the unique best start is 4, not the larger 5).',
  },
  {
    id: 'rb-coin-vending-4-7-26',
    difficulty: 3,
    coins: [4, 7],
    target: 26,
    prompt:
      'A vending machine takes only 4 and 7 credit tokens. Tap tokens until the slot reads exactly 26 credits.',
    hint: 'With no 1 token, not every count works — try fixing how many 7s you use, then see if the rest divides into 4s.',
    explanation:
      'There is exactly one way to hit 26 from 4s and 7s: 7+7+4+4+4 = 26 (two 7s leave 12 = three 4s). Any other count of 7s leaves a remainder that is not a multiple of 4, so reachability itself is the puzzle here.',
  },
  {
    id: 'rb-coin-casino-3-5-19',
    difficulty: 3,
    coins: [3, 5],
    target: 19,
    prompt:
      'At the casino you stack 3 and 5 value chips. Build a pile worth exactly 19.',
    hint: 'No 1 chip exists, so test combinations: how many 5s leave a remainder that splits cleanly into 3s?',
    explanation:
      'The only exact-19 pile is 5+5+3+3+3 = 19 (two 5s leave 9 = three 3s). One 5 leaves 14 and three 5s overshoot, so 19 has a single valid 3s-and-5s combination.',
  },
  {
    id: 'rb-coin-toll-1-5-7-10',
    difficulty: 3,
    coins: [1, 5, 7],
    target: 10,
    fewest: true,
    prompt:
      'A highway toll costs 10 and your purse holds 1, 5, and 7 value coins. Pay it in the fewest coins.',
    hint: 'Build 10 from a smaller already-solved amount plus one coin; the largest coin is rarely the right peel.',
    explanation:
      'Greedy takes 7 first, leaving 3 to cover as 1+1+1, for 7+1+1+1 = 4 coins. The optimum is 5+5 = 2 coins. best[10] = min over coins of 1 + best[10 − coin] picks the 5, not the 7.',
  },
  {
    id: 'rb-coin-arcade-1-6-7-12',
    difficulty: 3,
    coins: [1, 6, 7],
    target: 12,
    fewest: true,
    prompt:
      'An arcade dispenses 1, 6, and 7 value tickets. Reach exactly 12 tickets using as few as possible.',
    hint: 'Compare 1 + best[12 − coin] across your coins instead of always grabbing the biggest.',
    explanation:
      'Greedy grabs 7 first, then 1+1+1+1+1, giving 7+1+1+1+1+1 = 6 coins. The optimum is 6+6 = 2 coins. Solving best[12 − coin] for every coin reveals the 6 crushes the 7.',
  },
  {
    id: 'rb-coin-bridge-1-5-8-15',
    difficulty: 3,
    coins: [1, 5, 8],
    target: 15,
    fewest: true,
    prompt:
      'A footbridge turnstile takes 1, 5, and 8 value coins. Pay exactly 15 in the fewest coins.',
    hint: 'The biggest coin overshoots into an awkward remainder — test 1 + best[15 − coin] for every coin before committing.',
    explanation:
      'Greedy takes 8 first, leaving 7 = 5+1+1, for 8+5+1+1 = 4 coins. The optimum is 5+5+5 = 3 coins. The fewest-coins start is a 5, even though 8 is larger.',
  },
  {
    id: 'rb-coin-3-7-t27',
    difficulty: 3,
    coins: [3, 7],
    target: 27,
    prompt:
      'A token machine accepts only 3 and 7 credit tokens. Tap tokens until the slot reads exactly 27 credits.',
    hint: 'No 1 token exists. Fix how many 7s you use, then see if the remainder divides evenly into 3s.',
    explanation:
      'You can make 27 as nine 3s (3×9) or as 3 + 3 + 7 + 7 + 7 (two 3s and three 7s). With no 1-token, reaching the target exactly is the whole challenge; any exact-27 mix is accepted.',
  },
  {
    id: 'rb-coin-4-9-t30',
    difficulty: 3,
    coins: [4, 9],
    target: 30,
    prompt:
      'A locker bank takes 4 and 9 value coins. Build exactly 30 to open a locker.',
    hint: 'Try each count of 9s and check whether the leftover splits cleanly into 4s.',
    explanation:
      'The only exact-30 combination is 4 + 4 + 4 + 9 + 9 = 30 (three 4s and two 9s). Two 9s leave 12 = three 4s; any other count of 9s leaves a remainder that is not a multiple of 4.',
  },
  {
    id: 'rb-coin-1-9-10-t27-fewest',
    difficulty: 3,
    coins: [1, 9, 10],
    target: 27,
    fewest: true,
    prompt:
      'A vending machine takes 1, 9, and 10 value coins and needs exactly 27. Pay in the fewest coins.',
    hint: 'Grabbing 10s first leaves 7 to mop up with 1s. Compare against leaning on the 9s.',
    explanation:
      'Greedy takes 10 + 10 = 20, then seven 1s — nine coins! The optimum is 9 + 9 + 9 = 3 coins. This is an extreme greedy trap: the unique optimal first coin is 9, and the largest coin is by far the worst start.',
  },
  {
    id: 'rb-coin-1-7-8-t21-fewest',
    difficulty: 3,
    coins: [1, 7, 8],
    target: 21,
    fewest: true,
    prompt:
      'An arcade owes 21 in tickets of value 1, 7, and 8. Hand them out in the fewest tickets.',
    hint: 'Two 8s leave 5 to cover with 1s. Compare that against using the 7s — which divide 21 evenly.',
    explanation:
      'Greedy takes 8 + 8 = 16, then five 1s — seven tickets. The optimum is 7 + 7 + 7 = 3 tickets. The unique optimal first ticket is 7, not the larger 8.',
  },
  {
    id: 'rb-coin-5-8-t39',
    difficulty: 4,
    coins: [5, 8],
    target: 39,
    prompt:
      'A ferry turnstile accepts only 5 and 8 value tokens. Drop tokens to total exactly 39.',
    hint: 'How many 8s leave a multiple of 5 behind? Test 8s from high to low.',
    explanation:
      'The only exact-39 mix is 5 + 5 + 5 + 8 + 8 + 8 = 39 (three 5s and three 8s). Three 8s leave 15 = three 5s; no other count of 8s leaves a multiple of 5.',
  },
  {
    id: 'rb-coin-6-10-t38',
    difficulty: 4,
    coins: [6, 10],
    target: 38,
    prompt:
      'A laundromat changer holds 6 and 10 value coins. Build exactly 38 to start a load.',
    hint: 'Both coins are even, so 38 (even) is plausible — find the count of 10s whose remainder splits into 6s.',
    explanation:
      'The only exact-38 combination is 6 + 6 + 6 + 10 + 10 = 38 (three 6s and two 10s). Two 10s leave 18 = three 6s; other counts of 10s strand an awkward remainder.',
  },
  {
    id: 'rb-coin-parking-4-5-12',
    difficulty: 5,
    coins: [4, 5],
    target: 12,
    fewest: true,
    prompt:
      'A parking meter accepts only 4 and 5 value coins and needs exactly 12. Pay it in the fewest coins.',
    hint: 'There is no 1 coin — picking the bigger 5 first leaves a remainder you cannot complete, so check what each first coin strands.',
    explanation:
      'Greedy takes 5 first, leaving 7 — which is unmakeable from 4s and 5s, a dead end. The only solution is 4+4+4 = 3 coins, so the fewest-coins start is the smaller 4.',
  },
];

// Optimal-first-choice problems. The app computes the correct first coin via
// best[amount] = min over coins of 1 + best[amount − coin]; we only supply
// coins + amount + prose. The in-scope problems are greedy-biggest overshoot
// traps with a UNIQUE optimal first coin (1-coin present), so the largest coin
// is the wrong instinct. An easy authored rung opens the ramp where the obvious
// coin works; `rb-min-2-5-6` (no-1-coin stranding) sits last as the hardest.
// Ordered ASCENDING by difficulty.
export const minChoiceProblems: MinChoiceParams[] = [
  {
    id: 'rb-min-1-2-5-5',
    difficulty: 1,
    coins: [1, 2, 5],
    amount: 5,
    prompt:
      'You owe 5 and may pay with 1, 2, and 5 coins. Which single FIRST coin starts the fewest-coins solution?',
    hint: 'One of your coins is worth exactly the amount — what does 1 + best[5 − c] give when you pick it?',
    explanation:
      'A single 5 pays the whole amount in one coin, so best[5] = 1 and the optimal first coin is 5. Here the biggest coin really is best — an easy warm-up before the traps where it is not.',
  },
  {
    id: 'rb-min-1-3-4-6',
    difficulty: 2,
    coins: [1, 3, 4],
    amount: 6,
    prompt:
      'A toll booth needs 6 paid from 1, 3, and 4 coins. Which first coin leads to the fewest total coins?',
    hint: 'Compare 1 + best[6 − c] across the coins rather than reaching for the largest.',
    explanation:
      'Starting with 4 forces 4+1+1 = 3 coins. Starting with 3 gives 3+3 = 2 coins, the minimum. The best first coin is 3, even though 4 is larger.',
  },
  {
    id: 'rb-min-1-4-5-a8',
    difficulty: 2,
    coins: [1, 4, 5],
    amount: 8,
    prompt:
      'You owe 8 and may pay with 1, 4, and 5 coins. Which single FIRST coin starts the fewest-coins solution?',
    hint: 'For each coin c, compare 1 + best[8 − c]; pick the coin that minimizes it.',
    explanation:
      'Starting with 5 forces 5 + 1 + 1 + 1 = 4 coins. Starting with 4 gives 4 + 4 = 2 coins, the minimum. The best first coin is 4, even though 5 is larger.',
  },
  {
    id: 'rb-min-1-5-7-10',
    difficulty: 3,
    coins: [1, 5, 7],
    amount: 10,
    prompt:
      'You owe 10 and may pay with 1, 5, and 7 coins. Which single FIRST coin starts the fewest-coins solution?',
    hint: 'For each coin c, compare 1 + best[10 − c]; pick the coin that minimizes it.',
    explanation:
      'Starting with 7 forces 7+1+1+1 = 4 coins. Starting with 5 gives 5+5 = 2 coins, the minimum. The best first coin is 5, even though 7 is larger.',
  },
  {
    id: 'rb-min-1-6-7-12',
    difficulty: 3,
    coins: [1, 6, 7],
    amount: 12,
    prompt:
      'A cashier must give 12 in change using 1, 6, and 7 coins. Pick the best first coin to drop.',
    hint: 'Evaluate 1 + best[12 − c] for c = 1, 6, 7 and choose the smallest result.',
    explanation:
      'Choosing 7 first leaves 5 = 1+1+1+1+1, totalling 7+1+1+1+1+1 = 6 coins. Choosing 6 first gives 6+6 = 2 coins. So 6 is the optimal first coin, not the bigger 7.',
  },
  {
    id: 'rb-min-1-5-8-15',
    difficulty: 3,
    coins: [1, 5, 8],
    amount: 15,
    prompt:
      'You must hand over 15 using 1, 5, and 8 coins. Choose the smartest first coin.',
    hint: 'Solve 1 + best[15 − c] for each coin; the largest coin overshoots into an awkward remainder.',
    explanation:
      'Starting with 8 leaves 7 = 5+1+1, totalling 8+5+1+1 = 4 coins. Starting with 5 gives 5+5+5 = 3 coins. The optimal first coin is 5, beating the greedy 8.',
  },
  {
    id: 'rb-min-1-4-9-12',
    difficulty: 3,
    coins: [1, 4, 9],
    amount: 12,
    prompt:
      'An arcade kiosk owes 12 in tickets of value 1, 4, and 9. Which first ticket starts the fewest-tickets payout?',
    hint: 'Compare 1 + best[12 − c] for c = 1, 4, 9; the largest value is a trap.',
    explanation:
      'Starting with 9 leaves 3 = 1+1+1, totalling 9+1+1+1 = 4 coins. Starting with 4 gives 4+4+4 = 3 coins. The optimal first coin is 4, not the bigger 9.',
  },
  {
    id: 'rb-min-1-7-8-a21',
    difficulty: 3,
    coins: [1, 7, 8],
    amount: 21,
    prompt:
      'An arcade owes 21 and pays with 1, 7, and 8 coins. Which first coin leads to the fewest total coins?',
    hint: 'Compare 1 + best[21 − c] across the coins; 21 divides evenly by one of them.',
    explanation:
      'Starting with 8 leads to 8 + 8 + 1 + 1 + 1 + 1 + 1 = 7 coins. Starting with 7 gives 7 + 7 + 7 = 3 coins, the minimum. The best first coin is 7, not the larger 8.',
  },
  {
    id: 'rb-min-1-9-10-a27',
    difficulty: 3,
    coins: [1, 9, 10],
    amount: 27,
    prompt:
      'A machine must return 27 using 1, 9, and 10 coins. Choose the smartest first coin.',
    hint: 'Solve 1 + best[27 − c] for each coin; the largest coin leaves a remainder you mop up with 1s.',
    explanation:
      'Starting with 10 forces 10 + 10 + 1 × 7 = 9 coins. Starting with 9 gives 9 + 9 + 9 = 3 coins. The optimal first coin is 9 — a dramatic case where the biggest coin is the worst start.',
  },
  {
    id: 'rb-min-1-6-8-a18',
    difficulty: 3,
    coins: [1, 6, 8],
    amount: 18,
    prompt:
      'A kiosk owes 18 in coins of value 1, 6, and 8. Which first coin starts the fewest-coins payout?',
    hint: 'Compare 1 + best[18 − c] for c = 1, 6, 8; one coin divides 18 evenly.',
    explanation:
      'Starting with 8 leads to 8 + 8 + 1 + 1 = 4 coins. Starting with 6 gives 6 + 6 + 6 = 3 coins. The optimal first coin is 6, even though 8 is larger.',
  },
  {
    id: 'rb-min-1-8-9-a24',
    difficulty: 3,
    coins: [1, 8, 9],
    amount: 24,
    prompt:
      'A machine must return 24 using 1, 8, and 9 coins. Pick the best first coin to drop.',
    hint: 'Evaluate 1 + best[24 − c] for each coin; the largest value strands you on a remainder of 1s.',
    explanation:
      'Choosing 9 first cascades to 9 + 9 + 1 × 6 = 8 coins. Choosing 8 first gives 8 + 8 + 8 = 3 coins, the minimum. The optimal first coin is 8, not the bigger 9.',
  },
  {
    id: 'rb-min-2-5-6',
    difficulty: 4,
    coins: [2, 5],
    amount: 6,
    prompt:
      'A parking meter accepts only 2 and 5 coins and needs exactly 6. Which first coin can actually finish the job?',
    hint: 'Check 1 + best[6 − c] for each coin — one choice leaves a remainder you can never complete.',
    explanation:
      'Grabbing the bigger 5 first leaves 1, which cannot be made from 2s and 5s — a dead end. Only 2 works: 2+2+2 = 3 coins, so 2 is the best (and only valid) first coin.',
  },
];
