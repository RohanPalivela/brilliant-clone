import type { PathParams } from '../reviewBuilders';

// Path-building problems. Each target is reachable as an EXACT non-negative
// integer combination of its jumps (verified by hand in the comment beside it).
export const pathProblems: PathParams[] = [
  {
    id: 'rb-path-2-3-to-7',
    jumpSizes: [2, 3],
    target: 7, // 2 + 2 + 3 = 7
    prompt:
      'Build a climb from step 0 to exactly step 7 using only strides of 2 and 3. The strides must sum to 7 with no overshoot.',
    hint: 'Try mixing the strides: how many 2s and 3s add up to exactly 7?',
    explanation:
      'You need a non-negative mix of 2s and 3s totalling 7. Two 2s and one 3 give 2+2+3 = 7. Landing on step 8 or 9 overshoots and is illegal, so the sum must be exact.',
  },
  {
    id: 'rb-path-3-5-to-11',
    jumpSizes: [3, 5],
    target: 11, // 3 + 3 + 5 = 11
    prompt:
      'A frog crosses to lily pad 11 starting from pad 0, hopping only 3 or 5 pads each time. Choose hops that land it exactly on pad 11.',
    hint: 'Eleven is odd; combine an odd count of 5s with some 3s to hit it exactly.',
    explanation:
      'Use a non-negative combination of 3 and 5 summing to 11: two 3s and one 5 give 3+3+5 = 11. A single 5 plus 3 only reaches 8, and adding another 5 overshoots, so 3+3+5 is the clean exact path.',
  },
  {
    id: 'rb-path-3-5-to-13',
    jumpSizes: [3, 5],
    target: 13, // 3 + 5 + 5 = 13
    prompt:
      'Reach step 13 from step 0 on a staircase where every stride is 3 or 5 steps. Find strides that total exactly 13.',
    hint: 'Lean on the larger stride: how many 5s get you close, and which 3 finishes it?',
    explanation:
      'A valid exact sum is one 3 plus two 5s: 3+5+5 = 13. Three 5s would overshoot to 15, and any all-3s plan never hits 13, so mixing one 3 with two 5s is the way.',
  },
  {
    id: 'rb-path-2-5-to-9',
    jumpSizes: [2, 5],
    target: 9, // 2 + 2 + 5 = 9
    prompt:
      'A robot must stop exactly on cell 9, starting at cell 0 and moving forward by 2 or 5 each step. Pick moves that sum to 9.',
    hint: 'Nine is odd, so an odd number of 5s is needed. Fill the rest with 2s.',
    explanation:
      'Take one 5 and two 2s: 2+2+5 = 9. Without any 5 you can only reach even cells, and two 5s already overshoot to 10, so exactly one 5 plus a pair of 2s lands on 9.',
  },
  {
    id: 'rb-path-4-6-to-14',
    jumpSizes: [4, 6],
    target: 14, // 4 + 4 + 6 = 14
    prompt:
      'Climb to step 14 from the ground using only 4-step and 6-step strides. Your strides must add up to exactly 14.',
    hint: 'Both strides are even and 14 is even. How many 4s pair with a 6?',
    explanation:
      'Two 4s and one 6 give 4+4+6 = 14. A single 6 leaves 8, which is two more 4s but that totals 14 only as 6+4+4 — the same multiset. Three 4s reach just 12 and adding a 6 overshoots, so 4+4+6 is the exact fit.',
  },
  {
    id: 'rb-path-2-3-4-to-11',
    jumpSizes: [2, 3, 4],
    target: 11, // 4 + 4 + 3 = 11
    prompt:
      'On a number line you may step forward by 2, 3, or 4 at a time. Assemble a sequence of steps that stops precisely on cell 11.',
    hint: 'With three stride sizes there are many exact combinations — find any whose total is 11.',
    explanation:
      'One option is two 4s and a 3: 4+4+3 = 11. Many mixes work (for example 3+4+4 or 2+2+3+4), but each must sum to exactly 11; overshooting to 12 or beyond is not allowed.',
  },
  {
    id: 'rb-path-3-4-to-10',
    jumpSizes: [3, 4],
    target: 10, // 3 + 3 + 4 = 10
    prompt:
      'A hiker ascends to ledge 10 from ledge 0 using only 3-step and 4-step jumps. Choose jumps that total exactly 10.',
    hint: 'Try two of the smaller jump plus one of the larger.',
    explanation:
      'Two 3s and one 4 give 3+3+4 = 10. A single 4 plus 3 only reaches 7, and adding another 4 lands on 11 (overshoot), so two 3s and a 4 is the exact route to ledge 10.',
  },
];
