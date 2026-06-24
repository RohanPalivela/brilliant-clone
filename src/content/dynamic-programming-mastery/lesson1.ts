import type { Lesson } from '../../types/content';

// Lesson 1 — The staircase problem. Reachability discovered bottom-up
// (jumps of 3 or 5, target 11). Direct-instruction shape: show the problem with
// a labeled diagram, define ✓/✗ and the look-back arithmetic, let the learner
// feel how fiddly guessing a path forward is (PathBuilder), motivate looking
// backward, walk a smaller staircase step-by-step at the learner's own pace,
// name the look-backward idea on the abstract schematic, surface the insight
// with an MCQ, then guided + independent practice, then an animated DPTable
// replays the sweep.
export const lesson1: Lesson = {
  id: 'reach-the-top',
  courseId: 'dynamic-programming-mastery',
  title: 'The Staircase Problem',
  order: 1,
  estimatedMinutes: 15,
  slides: [
    {
      id: 'm1-s1',
      type: 'explain',
      component: 'StairGrid',
      props: {
        steps: 8,
        jumpSizes: [3, 5],
        editable: false,
        showSolution: true,
        arrowTargets: [3, 5, 8],
        highlightIndices: [0, 3, 5, 8],
        loop: true,
        prompt:
          'You start on the ground — step 0 — and every move climbs exactly 3 or 5 steps, only upward.\nThe arrows show the idea: from a step you can jump +3 or +5, and you chain those jumps to climb higher.\nSo, the question is: given a step, can you land on it exactly?',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s2',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'What ✓ and ✗ mean',
        body: 'Each step gets one of two marks. A step is ✓ when you can land on it with +3 and +5 jumps starting from the ground, and ✗ when no sequence of jumps ever lands there. Step 0 — the ground — is always ✓, because you’re already standing on it before you jump at all.',
        emphasis:
          'To decide a step, look back by each jump size. For `step 7`, you check `7 − 3 = 4` and `7 − 5 = 2`: step 7 is ✓ only if `step 4` or `step 2` is already ✓.',
        bodyFirst: true,
        visual: {
          component: 'StairGrid',
          steps: 7,
          jumpSizes: [3, 5],
          arrowTargets: [7],
          highlightIndices: [2, 4, 7],
          caption: 'Deciding `step 7`: the only steps that matter are 7 − 3 = 4 and 7 − 5 = 2.',
        },
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s2b',
      type: 'checkpoint',
      component: 'PathBuilder',
      props: {
        jumpSizes: [3, 5],
        target: 11,
        prompt:
          'Before we find a method, just try it by hand. Stack +3 and +5 jumps to land the climber exactly on step 11. Tap +3 or +5 to climb; overshooting is blocked, so you have to land precisely.\nNotice how much trial and error this takes — and that some choices strand you with no legal jump left.',
        caption:
          'Guessing your way up works for one short staircase but is fiddly and easy to get stuck on. Next we’ll see why brute force doesn’t scale — and find a smarter way.',
      },
      validation: { type: 'jumpPath', jumpSizes: [3, 5], target: 11 },
      hint: 'It takes three jumps that add to 11. Two of one size and one of the other — try starting with the small ones.',
      explanationOnWrong:
        'Land on 11 exactly: 3 + 3 + 5 = 11 (order doesn’t matter). Every move must be +3 or +5, and you can never step past the goal — if you’re stranded (say on 10 after 5 + 5), reset and try a different mix.',
    },
    {
      id: 'm1-s3',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Look backward, not forward',
        body: 'Why not just follow every jump forward from the ground? Because each step branches into +3 and +5 again and again — the paths double at every level and explode far faster than the staircase grows.',
        emphasis:
          'So we flip it around: to know if a step is reachable, we only ask whether the steps one jump before it are reachable. We move forward to reach the goal, but look backward to decide each step.',
        bodyFirst: true,
        visual: {
          component: 'ForwardExplosion',
          jumpSizes: [3, 5],
          depth: 3,
          caption: 'Every jump forward branches again — too many paths to ever trace by hand.',
        },
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s4',
      type: 'explore',
      component: 'StaircaseWalkthrough',
      props: {
        steps: 6,
        jumpSizes: [3, 5],
        prompt:
          'Watch me solve a shorter staircase first — one step at a time. Press Next (or use ← →) to decide each step at your own pace.',
        caption:
          'Each step is decided using only the steps below it — exactly the move you’ll use yourself in a moment.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s5',
      type: 'explain',
      component: 'SubproblemIsolation',
      props: {
        prompt:
          'You just saw this play out on the stairs: only the step 3 below and the step 5 below decide each step — the rest can stay unknown. If even one of those two is reachable, this step is reachable too.',
        caption:
          'This is called isolating the subproblem: one step’s answer depends only on a couple of smaller answers you’ve already worked out — everything else can stay unknown.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s6',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question:
          'Which earlier steps decide whether `step 7` is reachable?',
        options: [
          { id: 'fourtwo', label: '`step 4` and `step 2` — that’s 7 − 3 and 7 − 5' },
          { id: 'threefive', label: '`step 3` and `step 5` — the jump sizes' },
          { id: 'allbelow', label: 'Every step below 7' },
          { id: 'tentwelve', label: '`step 10` and `step 12`' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['fourtwo'] },
      hint: 'You can only arrive at a step by jumping +3 or +5 onto it. Subtract each jump from 7 to find the only two steps you could have come from.',
      explanationOnWrong:
        'Subtract each jump from the step itself: 7 − 3 = 4 and 7 − 5 = 2. Those are the only steps you could jump from, not the jump sizes. (Here both `step 4` and `step 2` happen to be ✗, so `step 7` is ✗ too.)',
    },
    {
      id: 'm1-s7',
      type: 'checkpoint',
      component: 'StairGrid',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 11,
        editable: true,
        showArrows: true,
        prefillUpTo: 6,
        prompt:
          'Let’s warm up together. Steps 0 through 6 are already solved and locked for you. Finish steps 7 to 11: for each one, follow its arrows to the step 3 below and the step 5 below — mark it ✓ if either is ✓, otherwise ✗. Tap a step once for ✓, tap again for ✗.',
      },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 11, target: 11 },
      hint: 'A step is ✓ only if (step − 3) or (step − 5) is ✓. The arrows point at exactly those two steps below.',
      explanationOnWrong:
        'Work upward from step 7. Each step is ✓ only when step − 3 or step − 5 is ✓ — the locked cells 0..6 are already correct, so just read them.',
    },
    {
      id: 'm1-s8',
      type: 'checkpoint',
      component: 'StairGrid',
      props: {
        steps: 11,
        jumpSizes: [3, 5],
        target: 11,
        editable: true,
        showArrows: true,
        prompt:
          'Now the whole thing, on your own — solve the staircase all the way to step 11. Start at the bottom (step 0 is already ✓) and work upward, one step at a time. Tap a step once to mark it ✓ if it can be reached, tap again for ✗ if it can’t. A step is ✓ only when the step 3 below or 5 below it is ✓.',
      },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 11, target: 11 },
      hint: 'A step is ✓ only if (step − 3) or (step − 5) is itself ✓. Work upward from step 0, which is always ✓.',
      explanationOnWrong:
        'Not quite. Start at step 0 (always ✓) and work upward: each step is ✓ only when step − 3 or step − 5 is ✓.',
    },
    {
      id: 'm1-s9',
      type: 'explore',
      component: 'DPTable',
      props: {
        mode: 'reachability',
        steps: 11,
        jumpSizes: [3, 5],
        prompt:
          'That’s the whole algorithm: each cell looks back only 3 and 5 to its left — never re-tracing every jump from the ground. Press play and watch the same rule fill the row, left to right.',
        caption: 'One sweep, each answer built from the ones before it.',
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s10',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'You just did dynamic programming',
        body: 'Instead of replaying every jump from the ground, you built each answer from smaller answers you already trusted. That’s all dynamic programming is: build each answer from a few smaller answers you already solved, filling a table once.',
        emphasis:
          'To know if step 11 is reachable, you only need steps 8 and 6 — that’s 11 − 3 and 11 − 5.',
        bodyFirst: true,
        visual: {
          component: 'StairGrid',
          steps: 11,
          jumpSizes: [3, 5],
          highlightIndices: [6, 8, 11],
          showArrows: true,
          arrowTargets: [11],
        },
      },
      validation: { type: 'none' },
    },
    {
      id: 'm1-s11',
      type: 'celebrate',
      component: 'RichText',
      props: {
        heading: 'This is bottom-up thinking',
        body: 'Determine the next state from the previous ones. Next, let’s give the staircase a memory: store each answer in an array so every step can be looked up instead of rediscovered.',
      },
      validation: { type: 'none' },
    },
  ],
};
