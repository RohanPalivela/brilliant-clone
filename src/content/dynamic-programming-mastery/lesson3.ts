import type { Lesson } from '../../types/content';

// Lesson 3 — Transfer the reachability method to a new jump set {2, 3, 4}.
// The method is identical; only the look-back distances change. The teacher
// works a small concrete example on an animated staircase, an MCQ surfaces the
// specific predecessors, then the learner fills a bigger staircase themselves
// before watching the same sweep run and recapping.
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
      hint: 'You reach step 6 by jumping up from below it. Subtract each allowed jump from 6 to find where you’d have come from.',
      explanationOnWrong:
        'Decide a step by subtracting each jump from it: 6 − 2 = 4, 6 − 3 = 3, 6 − 4 = 2. Step 6 is reachable if any of steps 4, 3, or 2 is. The jump sizes tell you how far to look back, not which step you start from.',
    },
    {
      id: 'm3-s3b',
      type: 'checkpoint',
      component: 'StairGrid',
      props: {
        steps: 7,
        jumpSizes: [2, 3, 4],
        target: 7,
        editable: true,
        showArrows: true,
        prefillUpTo: 3,
        prompt:
          'Your turn — solve the whole staircase to step 7 with jumps of 2, 3, or 4. Steps 0–3 are already filled in; work upward from step 4, one step at a time.\nTap a step once to mark it ✓ if it can be reached, tap again for ✗ if it can’t. A step is ✓ only when the step 2, 3, or 4 below it is ✓.',
      },
      validation: { type: 'reachability', jumpSizes: [2, 3, 4], steps: 7, target: 7 },
      hint: 'For each step i, look at i − 2, i − 3, and i − 4. If any of those is ✓, then i is ✓ too.',
      explanationOnWrong:
        'Work left to right. A step is ✓ only if (step − 2), (step − 3), or (step − 4) is ✓ — same method as before, just three look-backs instead of two.',
    },
    {
      id: 'm3-s4',
      type: 'checkpoint',
      component: 'RangeSelector',
      props: {
        min: 1,
        max: 7,
        target: 7,
        goalIndex: 7,
        jumpSizes: [2, 3, 4],
        prompt:
          'One more, on the number line. Drag the window to cover exactly the earlier steps that feed step 7 — the indices `7 − j` for each jump `j`.\nStep 7 is highlighted but not selectable; you’re choosing the steps it transitions from.',
      },
      validation: { type: 'range', correctIndices: [3, 4, 5] },
      hint: 'Step 7 depends on 7 − 2, 7 − 3, and 7 − 4.',
      explanationOnWrong:
        'Subtract each jump from 7: 7 − 4 = 3, 7 − 3 = 4, 7 − 2 = 5. The states you transition from are {3, 4, 5}.',
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
