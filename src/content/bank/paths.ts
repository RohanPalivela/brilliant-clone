import type { PathParams } from '../reviewBuilders';

// Path-building problems. Each target is reachable as an EXACT non-negative
// integer combination of its jumps (engine-confirmed unique multiset). Most are
// tuned so the GREEDY instinct — always taking the biggest jump — runs into a
// dead end (an overshoot with no legal move left), forcing the learner to reason
// backward and mix in smaller jumps. The easy rungs (difficulty 1–2) are the ones
// where greedy actually succeeds: a confidence-builder before the traps.
//
// Difficulty (1–5) tracks target size, multiset length, and how badly greedy
// fails. The array is ordered ASCENDING by difficulty. The concept tops out at 4
// (it is the same "back off the big jump" idea at every hard rung), so there is
// deliberately no difficulty-5 here.
export const pathProblems: PathParams[] = [
  {
    id: 'rb-path-2-5-to-9',
    difficulty: 1,
    jumpSizes: [2, 5],
    target: 9, // 2 + 2 + 5 = 9  (greedy 5 + 2 + 2 = 9 also works — warm-up)
    prompt:
      'A frog crosses to lily pad 9 from pad 0, hopping only 2 or 5 pads at a time. Land exactly on pad 9.',
    hint: 'One big 5-hop leaves 4 — which is just two 2-hops. There is only one mix that works.',
    explanation:
      'The only exact combination is 5 + 2 + 2 = 9 (one 5 and two 2s). Here even grabbing the 5 first finishes cleanly, so this is a confidence-builder before the greedy traps.',
  },
  {
    id: 'rb-path-2-7-to-11',
    difficulty: 2,
    jumpSizes: [2, 7],
    target: 11, // 2 + 2 + 7 = 11  (greedy 7 + 2 + 2 = 11 also works)
    prompt:
      'A robot must stop exactly on cell 11, starting at cell 0 and rolling forward by 2 or 7 each move. Pick moves that sum to 11.',
    hint: 'Use the big 7 once, then the remaining 4 splits into two 2s.',
    explanation:
      'The only exact route is 7 + 2 + 2 = 11. Since 11 is odd, you must use exactly one 7 (an odd jump) and fill the rest with 2s. A nice parity-reasoning warm-up.',
  },
  {
    id: 'rb-path-3-4-to-10',
    difficulty: 3,
    jumpSizes: [3, 4],
    target: 10, // 3 + 3 + 4 = 10  (greedy 4 + 4 = 8 dead-ends)
    prompt:
      'Climb to step 10 from the ground using only 3-step and 4-step strides. Your strides must total exactly 10.',
    hint: 'Two 4s put you on 8, where a 3 overshoots to 11 and a 4 to 12. Lean on the 3s instead.',
    explanation:
      'Greedy 4 + 4 = 8 dead-ends (both jumps overshoot 10 from there). The unique exact mix is 3 + 3 + 4 = 10 — two 3s and one 4.',
  },
  {
    id: 'rb-path-3-5-to-14',
    difficulty: 3,
    jumpSizes: [3, 5],
    target: 14, // 3 + 3 + 3 + 5 = 14  (greedy 5 + 5 + 3 = 13 dead-ends)
    prompt:
      'A hiker ascends to ledge 14 from ledge 0 using only 3-step and 5-step jumps. Choose jumps that total exactly 14.',
    hint: 'Two 5s and a 3 reach 13, then both jumps overshoot. Use a single 5 and pile on 3s.',
    explanation:
      'Greedy 5 + 5 + 3 = 13 is a dead end (3→16, 5→18 both overshoot 14). The unique exact path is 3 + 3 + 3 + 5 = 14 — three 3s and one 5.',
  },
  {
    id: 'rb-path-2-5-to-13',
    difficulty: 3,
    jumpSizes: [2, 5],
    target: 13, // 2 + 2 + 2 + 2 + 5 = 13  (greedy 5 + 5 + 2 = 12 dead-ends)
    prompt:
      'A frog leaps to lily pad 13 from pad 0, hopping 2 or 5 pads each time. Land exactly on pad 13.',
    hint: 'Two 5s and a 2 reach 12, then both hops overshoot. Use a single 5 and the rest 2s.',
    explanation:
      'Greedy 5 + 5 + 2 = 12 strands you (2→14, 5→17). The unique exact path is 2 + 2 + 2 + 2 + 5 = 13 — four 2s and one 5 (you must use exactly one odd 5-jump to hit the odd target).',
  },
  {
    id: 'rb-path-4-5-to-13',
    difficulty: 3,
    jumpSizes: [4, 5],
    target: 13, // 4 + 4 + 5 = 13  (greedy 5 + 5 = 10 dead-ends)
    prompt:
      'A frog crosses to lily pad 13 starting from pad 0, hopping only 4 or 5 pads at a time. Land exactly on pad 13 with no overshoot.',
    hint: 'Grabbing the big 5-hop twice strands you on 10 — both jumps then overshoot. How many 4s does it take instead?',
    explanation:
      'Greedy fails here: 5 + 5 = 10 leaves you stuck, since 4 jumps to 14 and 5 jumps to 15, both past 13. Back off and lean on the 4s — two 4s and one 5 give 4 + 4 + 5 = 13, the only exact mix.',
  },
  {
    id: 'rb-path-4-6-7-to-15',
    difficulty: 3,
    jumpSizes: [4, 6, 7],
    target: 15, // 4 + 4 + 7 = 15  (greedy 7 + 7 = 14 dead-ends)
    prompt:
      'A robot must stop exactly on cell 15, starting at cell 0 and rolling forward by 4, 6, or 7 each move. Pick moves that sum to 15.',
    hint: 'Two big 7s land you on 14 — one short, with every remaining move overshooting. Trade a 7 for a pair of 4s.',
    explanation:
      'Taking 7 + 7 = 14 is a trap: from 14 a 4, 6, or 7 all sail past 15. The exact route mixes the 7 with two 4s: 4 + 4 + 7 = 15. Reasoning backward from the goal beats grabbing the largest jump.',
  },
  {
    id: 'rb-path-5-6-to-16',
    difficulty: 3,
    jumpSizes: [5, 6],
    target: 16, // 5 + 5 + 6 = 16  (greedy 6 + 6 = 12 dead-ends)
    prompt:
      'Climb to step 16 from the ground using only 5-step and 6-step strides. Your strides must add up to exactly 16.',
    hint: 'Two 6s put you on 12, where a 5 overshoots to 17 and a 6 to 18. Try a pair of 5s instead.',
    explanation:
      'Greedy 6 + 6 = 12 dead-ends: both 5 and 6 overshoot from there. The clean fit is two 5s and one 6: 5 + 5 + 6 = 16. It is the unique multiset that lands exactly on 16.',
  },
  {
    id: 'rb-path-5-7-to-17',
    difficulty: 3,
    jumpSizes: [5, 7],
    target: 17, // 5 + 5 + 7 = 17  (greedy 7 + 7 = 14 dead-ends)
    prompt:
      'A hiker ascends to ledge 17 from ledge 0 using only 5-step and 7-step jumps. Choose jumps that total exactly 17.',
    hint: 'Two 7s strand you on 14 — a 5 jumps to 19, a 7 to 21. Swap one 7 for two 5s.',
    explanation:
      'The biggest-first plan 7 + 7 = 14 is a dead end, since every jump from 14 overshoots 17. The exact path is two 5s and one 7: 5 + 5 + 7 = 17, the only non-negative mix that works.',
  },
  {
    id: 'rb-path-4-7-to-22',
    difficulty: 4,
    jumpSizes: [4, 7],
    target: 22, // 4 + 4 + 7 + 7 = 22  (greedy 7 + 7 + 7 = 21 dead-ends)
    prompt:
      'A kangaroo bounds to marker 22 from marker 0, covering 4 or 7 units each bound. Land exactly on 22.',
    hint: 'Three 7s overshoot via 21→ dead end. Trade one 7 for a pair of 4s and keep two 7s.',
    explanation:
      'Greedy 7 + 7 + 7 = 21 strands you (4→25, 7→28). The unique exact path is 4 + 4 + 7 + 7 = 22 — two 4s and two 7s.',
  },
  {
    id: 'rb-path-5-8-to-26',
    difficulty: 4,
    jumpSizes: [5, 8],
    target: 26, // 5 + 5 + 8 + 8 = 26  (greedy 8 + 8 + 8 = 24 dead-ends)
    prompt:
      'A delivery bot must halt exactly on cell 26, advancing by 5 or 8 from cell 0. Pick moves that sum to 26.',
    hint: 'Three 8s reach 24 and strand you (5→29, 8→32). You need TWO of each jump — find the balance.',
    explanation:
      'Greedy 8 + 8 + 8 = 24 dead-ends. The unique exact mix is 5 + 5 + 8 + 8 = 26 — two 5s and two 8s. Requiring a balanced pair of each jump makes the backward reasoning harder.',
  },
  {
    id: 'rb-path-3-8-to-25',
    difficulty: 4,
    jumpSizes: [3, 8],
    target: 25, // 3 + 3 + 3 + 8 + 8 = 25  (greedy 8 + 8 + 8 = 24 dead-ends)
    prompt:
      'A robot must stop exactly on cell 25, advancing by 3 or 8 from cell 0. Find moves that sum to 25.',
    hint: 'Three 8s reach 24 and strand you. Use exactly two 8s, then fill the remaining 9 with 3s.',
    explanation:
      'Greedy 8 + 8 + 8 = 24 dead-ends (3→27, 8→32). The unique exact mix is 3 + 3 + 3 + 8 + 8 = 25 — three 3s and two 8s.',
  },
  {
    id: 'rb-path-6-7-to-18',
    difficulty: 4,
    jumpSizes: [6, 7],
    target: 18, // 6 + 6 + 6 = 18  (greedy 7 + 7 = 14 dead-ends; avoid the 7 entirely)
    prompt:
      'A climber scales to hold 18 from hold 0, reaching only 6 or 7 holds higher each pull. Land exactly on hold 18.',
    hint: 'The tempting 7-pull is a trap — once you take a couple, nothing finishes the climb. What if you never touch the 7 at all?',
    explanation:
      'Here the big jump is poison: 7 + 7 = 14 leaves you stuck (6 overshoots to 20, 7 to 21). The only exact path ignores the 7 completely — three 6s give 6 + 6 + 6 = 18.',
  },
  {
    id: 'rb-path-3-7-to-19',
    difficulty: 4,
    jumpSizes: [3, 7],
    target: 19, // 7 + 3 + 3 + 3 + 3 = 19  (greedy 7 + 7 + 3 = 17 dead-ends)
    prompt:
      'A frog leaps to lily pad 19 from pad 0, hopping only 3 or 7 pads each time. Find hops that land it exactly on pad 19.',
    hint: 'Two 7s plus a 3 reach 17, then both hops overshoot. Use just one 7 and pile on the 3s.',
    explanation:
      'Greedy grabs 7 + 7 = 14, then a 3 to 17 — and now 3 jumps to 20 and 7 to 26, both past 19. Use a single 7 with four 3s: 7 + 3 + 3 + 3 + 3 = 19, the unique exact combination.',
  },
  {
    id: 'rb-path-4-5-to-21',
    difficulty: 4,
    jumpSizes: [4, 5],
    target: 21, // 5 + 4 + 4 + 4 + 4 = 21  (greedy 5 + 5 + 5 + 5 = 20 dead-ends)
    prompt:
      'On a number line you may step forward by 4 or 5 at a time. Assemble a sequence of steps that stops precisely on cell 21.',
    hint: 'Four 5s march you to 20, where a 4 overshoots to 24 and a 5 to 25. Use a single 5 and the rest 4s.',
    explanation:
      'Stacking 5s gets you to 20 and then strands you — both jumps overshoot 21. The exact mix is one 5 and four 4s: 5 + 4 + 4 + 4 + 4 = 21, the only non-negative combination that lands on 21.',
  },
  {
    id: 'rb-path-3-5-to-22',
    difficulty: 4,
    jumpSizes: [3, 5],
    target: 22, // 5 + 5 + 3 + 3 + 3 + 3 = 22  (greedy 5 + 5 + 5 + 5 = 20 dead-ends)
    prompt:
      'A robot must halt exactly on cell 22, starting at cell 0 and advancing by 3 or 5 each step. Pick moves that sum to 22.',
    hint: 'Four 5s leave you on 20, where a 3 overshoots to 23 and a 5 to 25. Cap the 5s at two and fill with 3s.',
    explanation:
      'Greedy 5 + 5 + 5 + 5 = 20 is a dead end — every remaining jump overshoots 22. The unique exact path is two 5s and four 3s: 5 + 5 + 3 + 3 + 3 + 3 = 22.',
  },
];
