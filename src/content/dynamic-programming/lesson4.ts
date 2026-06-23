import type { Lesson } from '../../types/content';

// Lesson 4 — Name the pattern and bridge to code.
// Insight: this "build big from smaller, reuse sub-answers" shape is a named
// pattern that scales to non-obvious cases and collapses into a tiny loop. The
// capstone uses sparse, non-contiguous jumps {3, 7} to step 13 — six scattered
// dead-ends (1, 2, 4, 5, 8, 11) that can't be eyeballed, only swept bottom-up.
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
      type: 'prompt',
      component: 'StairGrid',
      props: {
        steps: 13,
        jumpSizes: [3, 7],
        target: 13,
        editable: true,
        prompt:
          'Capstone: jumps of 3 or 7, climbing to step 13. These jumps are sparse — you can’t guess the dead-ends, so sweep upward from 0.',
      },
      validation: { type: 'reachability', jumpSizes: [3, 7], steps: 13, target: 13 },
      hint: 'reachable[i] = reachable[i − 3] OR reachable[i − 7]. Build up one step at a time.',
      explanationOnWrong:
        'Work left to right: each step is ✓ only if (i − 3) or (i − 7) is ✓. Steps 1, 2, 4, 5, 8, and 11 never get a reachable launch pad.',
    },
    {
      id: 'l4-s4',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'From staircase to code',
        body: 'The same bottom-up sweep you did by hand becomes a short tabulation loop — one pass, each cell read from earlier cells:',
        pseudocode: [
          'reachable = [false] * (n + 1)',
          'reachable[0] = true',
          'for i in 1..n:',
          '    for j in jumps:',
          '        if i - j >= 0 and reachable[i - j]:',
          '            reachable[i] = true',
        ].join('\n'),
        emphasis: 'Next step: implement this in your language of choice.',
        visual: {
          component: 'StairGrid',
          steps: 13,
          jumpSizes: [3, 7],
          highlightIndices: [6, 10, 13],
        },
      },
      validation: { type: 'none' },
    },
    {
      id: 'l4-s5',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'You think in DP now',
        body: 'You discovered reachability, stored it in an array, generalized the rule, and named the pattern. That’s the core of dynamic programming.',
      },
      validation: { type: 'none' },
    },
  ],
};
