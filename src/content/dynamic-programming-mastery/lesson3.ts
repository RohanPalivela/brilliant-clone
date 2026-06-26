import type { Lesson } from '../../types/content';

// Lesson 3 — Transfer the reachability method to a new jump set {2, 3, 4}.
// The method is identical; only the look-back distances change. The teacher
// works a small concrete example on an animated staircase, an MCQ surfaces the
// specific predecessors, then — instead of re-filling yet another whole
// staircase by hand — the learner enacts "only the look-back set moved" by
// picking step 7's three predecessors directly. They then watch the same sweep
// produce a nearly-full map and name *why* it's so dense (the jump set controls
// reachability), which sets up the sparse capstone in lesson 4.
export const lesson3: Lesson = {
  id: 'changing-the-rules',
  courseId: 'dynamic-programming-mastery',
  title: 'Changing the Rules',
  order: 3,
  estimatedMinutes: 11,
  slides: [
    {
      id: 'm3-s1',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Same method, new jumps',
        body: 'New rule: each move may climb 2, 3, or 4 steps. Nothing about our approach changes — a step is still reachable only if some step one jump below it is reachable.',
        emphasis:
          'All that changes is which earlier steps you look back at. Swap the jump set, keep the method.',
        bodyFirst: true,
      },
      validation: { type: 'none' },
    },
    {
      id: 'm3-s2',
      type: 'explain',
      component: 'StairGrid',
      props: {
        steps: 7,
        jumpSizes: [2, 3, 4],
        editable: false,
        showSolution: true,
        showArrows: true,
        arrowTargets: [6],
        loop: true,
        highlightIndices: [2, 3, 4, 6],
        prompt:
          'Watch which steps decide step 6 now that a move can be 2, 3, or 4.\nYou could arrive at step 6 from 6 − 2 = 4, from 6 − 3 = 3, or from 6 − 4 = 2.\nThe three arrows draw in to show it: step 6 looks back at steps 4, 3, and 2 — three predecessors instead of the two you had before.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm3-s2b',
      type: 'explore',
      component: 'StaircaseWalkthrough',
      props: {
        steps: 6,
        jumpSizes: [2, 3, 4],
        prompt:
          'Let me walk a short {2, 3, 4} staircase end to end first. Press Next (or use ← →) to decide one step at a time and watch the look-back arrows swing into each step.',
        caption:
          'Every step is still decided by the steps below it — only now there are three places to look instead of two.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm3-s3',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'With jumps of 2, 3, or 4, which earlier steps decide whether you can land on `step 6`?',
        options: [
          {
            id: 'predecessors',
            label: 'Steps 4, 3, and 2 — that’s 6 − 2, 6 − 3, and 6 − 4',
          },
          { id: 'jumps', label: 'Steps 2, 3, and 4 — just read off the jump sizes' },
          { id: 'two', label: 'Just two steps, 6 − 2 and 6 − 3 — like the old rule' },
          { id: 'all', label: 'Every earlier step, 0 through 5' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['predecessors'] },
      hint: 'You land on step 6 by jumping up from below it. There are three allowed jumps now — subtract each one from 6 to find the steps you could have come from.',
      explanationOnWrong:
        'With three jump sizes there are three places to look back, not two. Watch out: the answer is not the sizes 2, 3, 4 themselves — those tell you how far to look, not which step you stand on. Subtract each jump from 6 to find the steps you could have launched from, and step 6 is reachable if any of them is.',
    },
    {
      id: 'm3-s3b',
      type: 'checkpoint',
      component: 'PredecessorPicker',
      props: {
        steps: 9,
        jumpSizes: [2, 3, 4],
        target: 7,
        variant: 'stairs',
        prompt:
          'Enact the only thing that changed: the look-back set. Tap the steps that decide step 7 now that a move can be 2, 3, or 4. Step 7 shows a “?” — you’re choosing which steps it looks back at, not its value.',
        caption:
          'Three jumps, so three look-backs — and because 2, 3, 4 are consecutive, the steps you tap happen to sit side by side.',
      },
      validation: { type: 'range', correctIndices: [3, 4, 5] },
      hint: 'Three jumps means three look-backs — so you should tap exactly three steps. Subtract each jump from 7, one tap per jump.',
      explanationOnWrong:
        'Check that you tapped exactly three steps, one for each jump. Subtract each jump from 7 to find the steps you would launch from — do not tap the jump sizes 2, 3, 4 themselves, and never a step above 7.',
    },
    {
      id: 'm3-s5',
      type: 'explore',
      component: 'DPTable',
      props: {
        mode: 'reachability',
        steps: 9,
        jumpSizes: [2, 3, 4],
        prompt:
          'Nothing about the algorithm changed — only the look-back distances. Watch the same left-to-right sweep solve a longer staircase, and notice each step reading the cells 2, 3, and 4 to its left.',
        caption: 'Swap the jump set and the same loop solves a new problem.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm3-s4',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: {
        question:
          'With jumps {2, 3, 4}, almost every step came out reachable — only step 1 was a dead end. Why so few gaps?',
        options: [
          {
            id: 'dense',
            label:
              'Small, closely-spaced jumps leave almost no step without a reachable step below it — the jump set controls how much you can reach',
          },
          { id: 'short', label: 'The staircase just wasn’t tall enough' },
          {
            id: 'order',
            label: 'Because we swept left to right instead of right to left',
          },
          { id: 'ground', label: 'Because step 0 is always reachable' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['dense'] },
      hint: 'Imagine the same {2, 3, 4} jumps on a much taller staircase — would gaps suddenly appear? Think about the biggest gap that could ever open up when your smallest jump is only 2.',
      explanationOnWrong:
        'It is not the staircase’s height or the sweep direction — a taller staircase with the same jumps would still have almost no gaps. The cause is the jump set: when the smallest jump is 2 and the sizes are consecutive, a reachable step is never far below, so dead ends cannot form. Picture sparse jumps like {3, 7} instead and you would see many more gaps.',
    },
    {
      id: 'm3-s6',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'One rule, any jump set',
        body: 'Finding a state is always the same job: look back at the states you can transition from, and reuse their answers. Before that was two cells; here step 7 reads steps 3, 4, and 5.',
        emphasis:
          'For any step i, look back at i − j for every allowed jump j. Reachable if any of them is reachable.',
        visual: {
          component: 'StairGrid',
          steps: 7,
          jumpSizes: [2, 3, 4],
          showArrows: true,
          arrowTargets: [7],
          highlightIndices: [3, 4, 5, 7],
        },
      },
      validation: { type: 'none' },
    },
    {
      id: 'm3-s7',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'Swap the jump set, keep the loop',
        body: 'You just retargeted the whole method to jumps {2, 3, 4} without rewriting a thing — only the look-back distances moved. Next we’ll give this pattern its name and write it as code that works for ANY jump set, not just the ones you’ve seen.',
      },
      validation: { type: 'none' },
    },
  ],
};
