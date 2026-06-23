import type { Lesson } from '../../types/content';

// Lesson 4 — Name the pattern and turn the by-hand sweep into code.
// We skip another staircase and go straight to programming: a fill-in-the-blank
// tabulation loop. The blanks are exactly the recurrence pieces the learner has
// been doing by hand (the ground case, the look-back i − j, and the cell to set).
export const lesson4: Lesson = {
  id: 'the-dp-mindset',
  courseId: 'dynamic-programming',
  title: 'The DP Mindset',
  order: 4,
  estimatedMinutes: 11,
  slides: [
    {
      id: 'l4-s1',
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
      id: 'l4-s2',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: {
        question:
          'Select every problem that is DP-shaped (its answer is built from smaller subproblems).',
        multiSelect: true,
        options: [
          { id: 'reach', label: 'Can you reach step N with a set of jumps?' },
          { id: 'fib', label: 'The Nth Fibonacci number (each = sum of previous two)' },
          { id: 'coins', label: 'Fewest coins to make an amount, given coin values' },
          { id: 'max', label: 'Find the largest number in a list' },
          { id: 'sort', label: 'Alphabetize a list of names' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['reach', 'fib', 'coins'] },
      hint: 'Which answers reuse the answers to smaller versions of the same problem?',
      explanationOnWrong:
        'Reachability, Fibonacci, and fewest-coins each build on smaller subproblems. Finding a max or sorting do not reuse sub-answers that way.',
    },
    {
      id: 'l4-s3',
      type: 'checkpoint',
      component: 'CodeBlanks',
      props: {
        prompt:
          'The by-hand sweep is just a loop. Drag the right pieces into the blanks to complete reachability.',
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
        'reachable[0] is the ground (True). You check the launch pad reachable[i − j], and when it’s reachable you set reachable[i] = True.',
    },
    {
      id: 'l4-s4',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'That’s tabulation',
        body: 'One pass, each cell read from earlier cells — the exact bottom-up sweep you did by hand, now as code that works for any jump set.',
        pseudocode: [
          'reachable = [False] * (n + 1)',
          'reachable[0] = True',
          'for i in range(1, n + 1):',
          '    for j in jumps:',
          '        if i - j >= 0 and reachable[i - j]:',
          '            reachable[i] = True',
        ].join('\n'),
      },
      validation: { type: 'none' },
    },
    {
      id: 'l4-s5',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'You think in DP now',
        body: 'You discovered reachability, stored it in an array, generalized the rule, and wrote the loop. Next, we’ll meet the very same pattern wearing a disguise: making change with coins.',
      },
      validation: { type: 'none' },
    },
  ],
};
