import type { Lesson } from '../../types/content';

// Lesson 3 — Transfer the pattern to a new jump set (2, 3, or 4).
// Insight: the method never changes; only the look-back set does — and the jump
// set controls how much is reachable. The near-full {2,3,4} map isn't filler:
// slide 5 turns "almost everything is reachable" into the density insight that
// sets up the sparse {3,7} capstone in Lesson 4.
export const lesson3: Lesson = {
  id: 'changing-the-rules',
  courseId: 'dynamic-programming',
  title: 'Changing the Rules',
  order: 3,
  estimatedMinutes: 13,
  slides: [
    {
      id: 'l3-s1',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'New rule: you may jump 2, 3, or 4 steps. Does the same bottom-up trick still reach step 11?',
        options: [
          { id: 'yes', label: 'Yes — same method, new jumps' },
          { id: 'no', label: 'No — we’d need a new approach' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['yes'] },
      hint: 'Nothing about the method depended on the jumps being 3 and 5.',
      explanationOnWrong:
        'The method is unchanged — you still ask "is any step one jump below me reachable?". Only the list of jumps is different (e.g. 3 + 4 + 4 = 11).',
    },
    {
      id: 'l3-s2',
      type: 'explore',
      component: 'RangeSelector',
      props: {
        min: 1,
        max: 10,
        target: 11,
        jumpSizes: [2, 3, 4],
        prompt:
          'Drag the two handles to sweep a window over the number line. Watch which prior steps fall inside it.',
      },
      validation: { type: 'none' },
      hint: 'The window is the set of steps you would look back at to decide F(11).',
    },
    {
      id: 'l3-s3',
      type: 'checkpoint',
      component: 'RangeSelector',
      props: {
        min: 1,
        max: 10,
        target: 11,
        jumpSizes: [2, 3, 4],
        prompt:
          'Set the window to exactly the steps that decide F(11) for jumps of 2, 3, or 4.',
      },
      validation: { type: 'range', correctIndices: [7, 8, 9] },
      hint: 'F(11) depends on 11 − 2, 11 − 3, and 11 − 4.',
      explanationOnWrong:
        'Subtract each jump from 11: 11 − 4 = 7, 11 − 3 = 8, 11 − 2 = 9. The window is {7, 8, 9}.',
    },
    {
      id: 'l3-s4',
      type: 'prompt',
      component: 'StairGrid',
      props: {
        steps: 11,
        jumpSizes: [2, 3, 4],
        target: 11,
        editable: true,
        prompt:
          'Mark the full reachability map for jumps of 2, 3, or 4. Notice how many steps end up reachable this time.',
      },
      validation: { type: 'reachability', jumpSizes: [2, 3, 4], steps: 11, target: 11 },
      hint: 'reachable[i] = reachable[i − 2] OR reachable[i − 3] OR reachable[i − 4].',
      explanationOnWrong:
        'For each step, look back at i − 2, i − 3, and i − 4. With a jump of 2 available, only step 1 stays out of reach.',
    },
    {
      id: 'l3-s5',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: {
        question:
          'Almost every step was reachable that time. Why does this jump set reach so much?',
        options: [
          {
            id: 'dense',
            label: 'Small, closely-spaced jumps leave few gaps — the jump set decides how much you can reach',
          },
          { id: 'eleven', label: 'Because the target happened to be 11' },
          { id: 'three', label: 'Because there are three jumps instead of two' },
          { id: 'luck', label: 'It was a coincidence of these particular numbers' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['dense'] },
      hint: 'With a jump of 2, every step two above a reachable one opens up. What does that do to the gaps?',
      explanationOnWrong:
        'The jump set controls reachability. Small, consecutive jumps (like 2, 3, 4) leave almost no gaps; sparse jumps leave many dead-ends — as you’ll see next lesson.',
    },
    {
      id: 'l3-s6',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'One rule, any jump set',
        body: 'The look-backs were a neat window {7, 8, 9} only because the jumps were consecutive. In general they’re just specific cells — i minus each allowed jump.',
        emphasis:
          'For any step i, look back at i − j for every allowed jump j. Reachable if any of them is reachable.',
        visual: {
          component: 'StairGrid',
          steps: 11,
          jumpSizes: [2, 3, 4],
          highlightIndices: [7, 8, 9, 11],
        },
      },
      validation: { type: 'none' },
    },
  ],
};
