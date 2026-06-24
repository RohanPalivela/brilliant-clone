import type { Lesson } from '../../types/content';

// Generalized staircase-reachability loop, shown three ways on the CodeViewer
// slide. All three are the same algorithm: seed the ground, then for each step
// try every jump and inherit reachability from the step you'd come from.
const reachablePython = `def reachable_steps(n, jumps):
    reachable = [False] * (n + 1)
    reachable[0] = True
    for i in range(1, n + 1):
        for j in jumps:
            if i - j >= 0 and reachable[i - j]:
                reachable[i] = True
    return reachable`;

const reachableJava = `boolean[] reachableSteps(int n, int[] jumps) {
    boolean[] reachable = new boolean[n + 1];
    reachable[0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j : jumps) {
            if (i - j >= 0 && reachable[i - j]) {
                reachable[i] = true;
            }
        }
    }
    return reachable;
}`;

const reachableCpp = `std::vector<bool> reachable_steps(int n, std::vector<int>& jumps) {
    std::vector<bool> reachable(n + 1, false);
    reachable[0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j : jumps) {
            if (i - j >= 0 && reachable[i - j]) {
                reachable[i] = true;
            }
        }
    }
    return reachable;
}`;

// Lesson 4 — Name the pattern and turn the by-hand sweep into code.
// We first ground the idea in a couple of build-from-smaller examples, then show
// the finished loop (in three languages), let the learner complete it from
// blanks, and finally name the bottom-up technique: tabulation.
export const lesson4: Lesson = {
  id: 'the-dp-mindset',
  courseId: 'dynamic-programming-mastery',
  title: 'The DP Mindset',
  order: 4,
  estimatedMinutes: 12,
  slides: [
    {
      id: 'm4-s1',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'What dynamic programming really is',
        emphasis:
          'Build solutions to big problems from solutions to smaller subproblems.',
        body: 'That’s the whole idea. The staircase was one instance of it.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm4-s1b',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Example: Fibonacci',
        body: 'Each Fibonacci number is just the two before it added together: F(n) = F(n−1) + F(n−2). Start from 0 and 1, and every new term is built from answers you already have.',
        visual: {
          component: 'FibonacciSequence',
          jumpSizes: [],
          count: 7,
          seeds: [0, 1],
          label: 'F',
          caption: 'Each term is the sum of the two cells before it.',
        },
      },
      validation: { type: 'none' },
    },
    {
      id: 'm4-s1c',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Example: ways up the stairs',
        body: 'How many ways can you climb n stairs taking 1 or 2 at a time? Your last move was either a single or a double, so ways(n) = ways(n−1) + ways(n−2) — the same build-from-smaller shape wearing different clothes.',
        visual: {
          component: 'FibonacciSequence',
          jumpSizes: [],
          count: 6,
          seeds: [1, 2],
          label: 'W',
          startIndex: 1,
          caption: 'W(n) counts the ways to reach stair n. Same recurrence, new story.',
        },
      },
      validation: { type: 'none' },
    },
    {
      id: 'm4-s2',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: {
        question:
          'Select every problem that is DP-shaped (its answer is built from smaller subproblems).',
        multiSelect: true,
        options: [
          { id: 'lcs', label: 'Longest common subsequence of two strings' },
          { id: 'editdist', label: 'Fewest edits to turn one word into another' },
          { id: 'gridpaths', label: 'Count the paths through a grid, moving only right or down' },
          { id: 'binsearch', label: 'Find a value in a sorted list' },
          { id: 'reverse', label: 'Reverse a string' },
          { id: 'maxlist', label: 'Find the largest number in a list' },
        ],
      },
      validation: {
        type: 'multipleChoice',
        correctIds: ['lcs', 'editdist', 'gridpaths'],
      },
      hint: 'Which answers reuse the answers to smaller versions of the same problem?',
      explanationOnWrong:
        'Longest common subsequence, edit distance, and grid path-counting each build their answer from smaller subproblems. Searching a sorted list, reversing a string, and scanning for a max just walk the data once — there are no sub-answers to reuse.',
    },
    {
      id: 'm4-s3',
      type: 'explain',
      component: 'CodeViewer',
      props: {
        prompt:
          'Here’s that by-hand sweep written as a real function — one generalized loop that works for any jump set, not just `[3, 5]`. Start every step False, mark the ground (index `0`) True, then for each step try each jump: if the step you’d come from is reachable, so is this one. Flip between languages — the logic is identical.',
        filename: 'reachable_steps',
        tabs: [
          { id: 'py', label: 'Python', language: 'py', code: reachablePython },
          { id: 'java', label: 'Java', language: 'java', code: reachableJava },
          { id: 'cpp', label: 'C++', language: 'cpp', code: reachableCpp },
        ],
      },
      validation: { type: 'none' },
    },
    {
      id: 'm4-s4',
      type: 'checkpoint',
      component: 'CodeBlanks',
      props: {
        prompt:
          'Now you complete it. Drag the right pieces into the blanks to finish the same reachability loop.',
        codeLines: [
          [{ type: 'text', value: 'reachable = [False] * (n + 1)' }],
          [
            { type: 'text', value: 'reachable[' },
            { type: 'blank', id: 'ground' },
            { type: 'text', value: '] = True' },
          ],
          [{ type: 'text', value: 'for i in range(1, n + 1):' }],
          [{ type: 'text', value: '    for j in jumps:' }],
          [
            { type: 'text', value: '        if i - j >= 0 and reachable[' },
            { type: 'blank', id: 'lookback' },
            { type: 'text', value: ']:' },
          ],
          [
            { type: 'text', value: '            reachable[' },
            { type: 'blank', id: 'current' },
            { type: 'text', value: '] = True' },
          ],
        ],
        tokens: [
          { id: 'zero', label: '0' },
          { id: 'iminusj', label: 'i - j' },
          { id: 'i', label: 'i' },
          { id: 'n', label: 'n' },
          { id: 'iplusj', label: 'i + j' },
          { id: 'j', label: 'j' },
        ],
      },
      validation: {
        type: 'codeBlanks',
        correct: { ground: 'zero', lookback: 'iminusj', current: 'i' },
      },
      hint: 'The ground (index 0) starts reachable. You arrive at i from i − j, and the cell you set is i itself.',
      explanationOnWrong:
        'reachable[0] is the ground (True). You check the step you’d come from, reachable[i − j], and when it’s reachable you set reachable[i] = True.',
    },
    {
      id: 'm4-s4b',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'The name for this: tabulation',
        bodyFirst: true,
        body: 'You just filled a table from the bottom up — every entry computed once, in order, each one reading answers that already sit in earlier cells. That approach has a name.',
        emphasis:
          'Tabulation: build a table once, bottom-up, with each answer read from earlier subproblems.',
        bullets: [
          'Base case first — seed what you know outright (the ground, reachable[0] = True).',
          'Iterate over states — walk every step from small to large.',
          'Read earlier answers — each entry only looks back at cells already filled.',
          'No subproblem is ever solved twice.',
          'Its mirror image is top-down memoization: start at the goal, recurse, and cache answers. Same subproblems — opposite direction.',
        ],
      },
      validation: { type: 'none' },
    },
    {
      id: 'm4-s5',
      type: 'explore',
      component: 'DPTable',
      props: {
        mode: 'reachability',
        steps: 11,
        jumpSizes: [3, 5],
        prompt:
          'Watch tabulation happen. The base case (step `0`) is filled first, then each cell is decided left to right by reading the earlier entries it can jump from — the highlighted cells are exactly the `i - j` look-backs.',
        caption: 'Bottom-up, one pass, no cell revisited — that’s the whole technique.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm4-s6',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'You think in DP now',
        body: 'You discovered reachability, stored it in an array, generalized the rule, wrote the loop, and learned its name — tabulation. Next, we’ll meet the very same pattern wearing a disguise: making change with coins.',
      },
      validation: { type: 'none' },
    },
  ],
};
