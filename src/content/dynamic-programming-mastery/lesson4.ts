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
    return reachable[n]`;

const reachableJava = `boolean reachableSteps(int n, int[] jumps) {
    boolean[] reachable = new boolean[n + 1];
    reachable[0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j : jumps) {
            if (i - j >= 0 && reachable[i - j]) {
                reachable[i] = true;
            }
        }
    }
    return reachable[n];
}`;

const reachableCpp = `bool reachable_steps(int n, std::vector<int>& jumps) {
    std::vector<bool> reachable(n + 1, false);
    reachable[0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j : jumps) {
            if (i - j >= 0 && reachable[i - j]) {
                reachable[i] = true;
            }
        }
    }
    return reachable[n];
}`;

// Lesson 4 — Name the pattern and turn the by-hand sweep into code.
// Arc: reconnect to the reachability sweep you already did by hand → ground the
// "build from smaller answers" idea, showing the same table shape behind
// reachability, Fibonacci, and counting ways (only the combine step — OR vs SUM
// — changes) → name the technique (tabulation) → read the finished loop for the
// steps example, noting it extends to other problems later → write it from
// blanks. Name → read → write, just like lessons 5 and 6.
export const lesson4: Lesson = {
  id: 'the-dp-mindset',
  courseId: 'dynamic-programming-mastery',
  title: 'The DP Mindset',
  order: 4,
  estimatedMinutes: 14,
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
      id: 'm4-s1a',
      type: 'explain',
      component: 'ArrayRow',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        editable: false,
        showSolution: true,
        display: 'binary',
        name: 'reachable[]',
        highlightIndices: [6, 8, 11],
        showArrows: true,
        arrowTargets: [11],
        prompt:
          'Remember this? Jumps {3, 5}, eleven steps. You already swept this array by hand — `step 11` was reachable because `step 8` (11 − 3) or `step 6` (11 − 5) was.\nEach answer was built from smaller answers you’d already worked out — that’s the shape we just named. And once you spot that shape, you start seeing it everywhere.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm4-s1b',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Example: Fibonacci',
        body: 'The same build-from-smaller shape shows up far beyond the stairs. Each Fibonacci number is the two before it added together: F(n) = F(n−1) + F(n−2). Start from 0 and 1, and every new term is built from answers you already have.',
        emphasis:
          'Notice the combine step here is addition — you SUM the two earlier cells, not OR them.',
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
        emphasis:
          'Counting ways also SUMS — you ADD the number of ways from each case, because every way through n−1 and every way through n−2 is its own distinct path.',
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
      id: 'm4-s1d',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Same shape, one moving part',
        body: 'Here’s the reassuring part: these problems are almost identical. Reachability, Fibonacci, counting ways — they all fill the same table shape, each cell built from the same smaller cells (the i − j look-backs). The only thing that changes from one problem to the next is how you compute the present cell from those earlier states.',
        bullets: [
          'Reachability asks “can I get here?” → compute the cell by OR-ing the look-backs: reachable if ANY predecessor is reachable.',
          'Fibonacci and counting ways ask “how many?” → compute the cell by SUMMING the look-backs: ADD the counts from each case.',
        ],
        emphasis:
          'Same states, same look-backs — only the computation from earlier states to the present one changes with the question (OR, SUM, and later min or max).',
        bodyFirst: true,
      },
      validation: { type: 'none' },
    },
    {
      id: 'm4-s4b',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'The name for this: tabulation',
        bodyFirst: true,
        body: 'This way of working — fill a table from the bottom up, every entry computed once, in order, each one reading answers that already sit in earlier cells — is exactly what you’ve been doing across reachability, Fibonacci, and counting ways. It has a name.',
        emphasis:
          'Tabulation: build a table once, bottom-up, with each answer read from earlier subproblems.',
        bullets: [
          'Base case first — seed what you know outright (the ground, reachable[0] = True).',
          'Iterate over states — walk every step from small to large.',
          'Read earlier answers — each entry only looks back at cells already filled.',
          'No subproblem is ever solved twice.',
          'There’s a mirror-image approach, top-down memoization, that starts at the goal and caches as it recurses — we’ll stick with tabulation here.',
        ],
      },
      validation: { type: 'none' },
    },
    {
      id: 'm4-s3',
      type: 'explain',
      component: 'CodeViewer',
      props: {
        prompt:
          'Here’s the staircase reachability sweep written as a real function — this one is for the steps example specifically, but the very same tabulation skeleton (seed the base case, walk the states, read earlier answers) extends to the other problems we’ll tackle later; only the combine step changes. Start every step False, mark the ground (index `0`) True, then for each step try each jump: if the step you’d come from is reachable, so is this one. Flip between languages — the logic is identical.',
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
          'Now you write it. Drag the right pieces into the blanks to finish the same reachability loop.',
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
      id: 'm4-s6',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'You think in DP now',
        body: 'You reconnected the by-hand sweep, saw the same table shape behind reachability, Fibonacci, and counting ways, separated OR from SUM, named the technique — tabulation — and wrote the loop yourself. Next, we’ll meet the very same pattern wearing a disguise: making change with coins.',
      },
      validation: { type: 'none' },
    },
  ],
};
