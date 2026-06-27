import type { Slide } from '../../types/content';

// Hand-authored review problems for the two patterns whose answers are
// author-specified rather than engine-computed: "recurrence in code"
// (CodeBlanks) and "spotting the pattern" (MultipleChoice). These stay strictly
// inside what the lessons teach — 1D staircase / coin-change recurrences — and
// every answer is verified by hand. ids are prefixed 'rb-code-' / 'rb-mcq-'.
//
// CodeBlanks rule: the widget lets each token fill at most ONE blank, so no two
// blanks in a slide ever share a token id (look-alike labels use distinct ids).
//
// This array holds TWO skills (recurrence-code + pattern-reasoning) interleaved,
// and is ordered ASCENDING by `difficulty` so each skill's subsequence still
// ramps easy→hard for the seeder. Difficulty tracks blank count + trap operators
// (CodeBlanks) and synthesis depth (MCQ).
export const conceptProblems: Slide[] = [
  // ---------- difficulty 2 ----------
  {
    id: 'rb-code-canmake',
    type: 'checkpoint',
    difficulty: 2,
    component: 'CodeBlanks',
    props: {
      prompt:
        'This is the coin-change feasibility sweep — the staircase reachability loop with coins as the jumps. Drag the right pieces into the blanks.',
      codeLines: [
        [{ type: 'text', value: 'can_make = [False] * (amount + 1)' }],
        [
          { type: 'text', value: 'can_make[' },
          { type: 'blank', id: 'ground' },
          { type: 'text', value: '] = True' },
        ],
        [{ type: 'text', value: 'for a in range(1, amount + 1):' }],
        [{ type: 'text', value: '    for c in coins:' }],
        [
          { type: 'text', value: '        if a - c >= 0 and can_make[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: ']:' },
        ],
        [
          { type: 'text', value: '            can_make[' },
          { type: 'blank', id: 'current' },
          { type: 'text', value: '] = True' },
        ],
      ],
      tokens: [
        { id: 'zero', label: '0' },
        { id: 'aminusc', label: 'a - c' },
        { id: 'a', label: 'a' },
        { id: 'c', label: 'c' },
        { id: 'amount', label: 'amount' },
        { id: 'aplusc', label: 'a + c' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { ground: 'zero', lookback: 'aminusc', current: 'a' },
    },
    hint: 'Amount 0 is always makeable (use no coins). An amount a is makeable if some smaller already-solved amount a − c is.',
    explanationOnWrong:
      'Seed can_make[0] = True (zero needs no coins). Then a is makeable when the earlier amount a − c is makeable, so you read can_make[a − c] and set can_make[a].',
  },
  {
    id: 'rb-code-stair-reach',
    type: 'checkpoint',
    difficulty: 2,
    component: 'CodeBlanks',
    props: {
      prompt:
        'The staircase reachability sweep: a step is reachable if some step one jump below it is. Drag the right pieces into the blanks.',
      codeLines: [
        [{ type: 'text', value: 'reachable = [False] * (n + 1)' }],
        [
          { type: 'text', value: 'reachable[' },
          { type: 'blank', id: 'ground' },
          { type: 'text', value: '] = True' },
        ],
        [{ type: 'text', value: 'for i in range(1, n + 1):' }],
        [{ type: 'text', value: '    for s in steps:' }],
        [
          { type: 'text', value: '        if i - s >= 0 and reachable[' },
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
        { id: 'iminuss', label: 'i - s' },
        { id: 'i', label: 'i' },
        { id: 'n', label: 'n' },
        { id: 'ipluss', label: 'i + s' },
        { id: 's', label: 's' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { ground: 'zero', lookback: 'iminuss', current: 'i' },
    },
    hint: 'Step 0 is always reachable (you start there). Step i is reachable if some earlier step i − s is.',
    explanationOnWrong:
      'Seed reachable[0] = True. Then step i is reachable when the earlier step i − s is reachable, so you read reachable[i − s] and set reachable[i]. Looking forward to i + s would read steps you have not computed yet.',
  },
  {
    id: 'rb-mcq-predecessors',
    type: 'checkpoint',
    difficulty: 2,
    component: 'MultipleChoice',
    props: {
      question:
        'In a reachability sweep with jumps {2, 5}, what does cell 9 depend on?',
      options: [
        { id: 'pred', label: 'Whether cell 7 (9−2) or cell 4 (9−5) is reachable' },
        { id: 'all', label: 'Whether every earlier cell is reachable' },
        { id: 'next', label: 'Whether cell 10 or 11 ahead is reachable' },
        { id: 'adjacent', label: 'Whether cell 8, directly below it, is reachable' },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['pred'] },
    hint: 'Subtract each jump from 9. A cell looks backward by exactly one jump, not at neighbours or the future.',
    explanationOnWrong:
      'A cell is reachable iff at least one of (cell − jump) is reachable. For cell 9 with jumps {2, 5} that means cell 7 or cell 4 — its predecessors — not all earlier cells, not the adjacent cell, and never a forward cell.',
  },
  {
    id: 'rb-mcq-base-zero',
    type: 'checkpoint',
    difficulty: 2,
    component: 'MultipleChoice',
    props: {
      question:
        'In the fewest-coins table best[a] = 1 + min over coins of best[a − c], what must best[0] be seeded to?',
      options: [
        { id: 'zero', label: '0 — it takes no coins to make the amount 0.' },
        { id: 'one', label: '1 — you always need at least one coin.' },
        { id: 'inf', label: 'INF — amount 0 is a special unreachable case.' },
        { id: 'none', label: 'It does not matter; best[0] is never read.' },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['zero'] },
    hint: 'How many coins does it take to make a total of zero?',
    explanationOnWrong:
      'Making amount 0 needs no coins, so best[0] = 0. Every other entry builds on it as 1 + best[a − c]; if best[0] were 1 or INF, every count built from it would be off by one or blocked entirely. best[0] is read constantly (whenever a − c = 0).',
  },
  {
    id: 'rb-mcq-reach-or',
    type: 'checkpoint',
    difficulty: 2,
    component: 'MultipleChoice',
    props: {
      question:
        'In a reachability sweep with jumps {3, 5}, how do you combine the look-backs to decide cell 8?',
      options: [
        {
          id: 'or',
          label: 'OR: cell 8 is reachable if cell 5 (8−3) OR cell 3 (8−5) is reachable.',
        },
        {
          id: 'and',
          label: 'AND: cell 8 is reachable only if BOTH cell 5 and cell 3 are reachable.',
        },
        {
          id: 'sum',
          label: 'SUM: add the truth of cell 5 and cell 3 to get cell 8.',
        },
        {
          id: 'min',
          label: 'MIN: take the smaller of cell 5 and cell 3.',
        },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['or'] },
    hint: 'You only need ONE working path into a cell for it to be reachable.',
    explanationOnWrong:
      'Reachability is a yes/no OR: a single reachable predecessor (cell 5 or cell 3) is enough. AND would wrongly demand every predecessor; SUM and MIN belong to counting and fewest-coins, not feasibility.',
  },
  {
    id: 'rb-mcq-lookback-direction',
    type: 'checkpoint',
    difficulty: 2,
    component: 'MultipleChoice',
    props: {
      question:
        'A bottom-up tabulation fills cells left to right. With jumps {2, 6}, which cells may cell 10 safely read?',
      options: [
        { id: 'back', label: 'Cells 8 (10−2) and 4 (10−6) — its look-backs, already computed.' },
        { id: 'forward', label: 'Cells 12 (10+2) and 16 (10+6) — its look-aheads.' },
        { id: 'adjacent', label: 'Cell 9, directly before it.' },
        { id: 'all', label: 'Every earlier cell 0 through 9.' },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['back'] },
    hint: 'Subtract each jump from 10. A bottom-up loop can only trust cells it has ALREADY filled.',
    explanationOnWrong:
      'Cell 10 depends on i − jump, i.e. cells 8 and 4 — both already computed when the sweep reaches 10. Forward cells 12/16 are not yet filled, the adjacent cell 9 is not exactly one jump back, and you do not read all earlier cells, only the look-backs.',
  },
  // ---------- difficulty 3 ----------
  {
    id: 'rb-code-countways',
    type: 'checkpoint',
    difficulty: 3,
    component: 'CodeBlanks',
    props: {
      prompt:
        'Counting ordered ways to climb a staircase. Same table shape as reachability, but the combine step is different — choose the operator AND the seed carefully.',
      codeLines: [
        [{ type: 'text', value: 'ways = [0] * (n + 1)' }],
        [
          { type: 'text', value: 'ways[0] = ' },
          { type: 'blank', id: 'seed' },
        ],
        [{ type: 'text', value: 'for i in range(1, n + 1):' }],
        [{ type: 'text', value: '    for s in steps:' }],
        [{ type: 'text', value: '        if i - s >= 0:' }],
        [
          { type: 'text', value: '            ways[i] ' },
          { type: 'blank', id: 'op' },
          { type: 'text', value: ' ways[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: ']' },
        ],
      ],
      tokens: [
        { id: 'one', label: '1' },
        { id: 'zero', label: '0' },
        { id: 'iminuss', label: 'i - s' },
        { id: 'ipluss', label: 'i + s' },
        { id: 'plusEq', label: '+=' },
        { id: 'eq', label: '=' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { seed: 'one', op: 'plusEq', lookback: 'iminuss' },
    },
    hint: 'There is exactly one way to stand at the bottom (do nothing), so ways[0] = 1. Each predecessor i − s contributes its OWN count, and they ACCUMULATE.',
    explanationOnWrong:
      'Seed ways[0] = 1 (one empty way); 0 makes every count stay 0. Each step s reaches i from i − s, and every predecessor adds its count, so accumulate with += (a plain = would overwrite and keep only the last predecessor). Look back to i − s, not forward to i + s.',
  },
  {
    id: 'rb-code-mincoins-init',
    type: 'checkpoint',
    difficulty: 3,
    component: 'CodeBlanks',
    props: {
      prompt:
        'The fewest-coins table again, but this time the INITIAL fill and the per-coin cost are hidden. What must the table start as so that min works, and what does laying one coin cost?',
      codeLines: [
        [
          { type: 'text', value: 'best = [' },
          { type: 'blank', id: 'init' },
          { type: 'text', value: '] * (amount + 1)' },
        ],
        [{ type: 'text', value: 'best[0] = 0' }],
        [{ type: 'text', value: 'for a in range(1, amount + 1):' }],
        [{ type: 'text', value: '    for c in coins:' }],
        [{ type: 'text', value: '        if a - c >= 0 and best[a - c] != INF:' }],
        [
          { type: 'text', value: '            best[a] = min(best[a], ' },
          { type: 'blank', id: 'plus' },
          { type: 'text', value: ' + best[a - c])' },
        ],
      ],
      tokens: [
        { id: 'inf', label: 'INF' },
        { id: 'zero', label: '0' },
        { id: 'one', label: '1' },
        { id: 'c', label: 'c' },
        { id: 'amount', label: 'amount' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { init: 'inf', plus: 'one' },
    },
    hint: 'For a min to ever improve, every unknown amount must start as something huge. And reaching a from a − c costs exactly one coin.',
    explanationOnWrong:
      'Fill the table with INF so any real solution beats the placeholder under min (starting at 0 would falsely report 0 coins). Laying one coin to drop from a to a − c adds exactly 1, so the candidate is 1 + best[a − c].',
  },
  {
    id: 'rb-code-min-steps',
    type: 'checkpoint',
    difficulty: 3,
    component: 'CodeBlanks',
    props: {
      prompt:
        'The fewest-moves staircase table: each step stacks one move on top of the best smaller step. Pick the seed, the combine operator, and the cost of one move.',
      codeLines: [
        [{ type: 'text', value: 'best = [INF] * (n + 1)' }],
        [
          { type: 'text', value: 'best[0] = ' },
          { type: 'blank', id: 'seed' },
        ],
        [{ type: 'text', value: 'for i in range(1, n + 1):' }],
        [{ type: 'text', value: '    for s in steps:' }],
        [{ type: 'text', value: '        if i - s >= 0:' }],
        [
          { type: 'text', value: '            best[i] = ' },
          { type: 'blank', id: 'op' },
          { type: 'text', value: '(best[i], ' },
          { type: 'blank', id: 'plus' },
          { type: 'text', value: ' + best[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: '])' },
        ],
      ],
      tokens: [
        { id: 'zero', label: '0' },
        { id: 'one', label: '1' },
        { id: 'iminuss', label: 'i - s' },
        { id: 'ipluss', label: 'i + s' },
        { id: 'min', label: 'min' },
        { id: 'max', label: 'max' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { seed: 'zero', op: 'min', plus: 'one', lookback: 'iminuss' },
    },
    hint: 'It takes 0 moves to stand at step 0. Reaching step i costs exactly 1 move on top of the best way to reach i − s, and you want the FEWEST moves.',
    explanationOnWrong:
      'Seed best[0] = 0. One move adds 1 to the cost of the subproblem i − s, so the candidate is 1 + best[i − s]. Because you want the fewest moves, combine with min (max chases the most moves, and i + s looks past the goal).',
  },
  {
    id: 'rb-mcq-greedy',
    type: 'checkpoint',
    difficulty: 3,
    component: 'MultipleChoice',
    props: {
      question:
        'Greedy (always grab the largest coin that fits) is optimal for canonical sets like {1, 5, 10, 25} but not in general. For coins {1, 5, 7}, at which amount does greedy use MORE coins than necessary?',
      options: [
        {
          id: 'ten',
          label: 'Amount 10: greedy takes 7 + 1 + 1 + 1 (4 coins), but 5 + 5 needs only 2.',
        },
        {
          id: 'twelve',
          label: 'Amount 12: greedy takes 7 + 5 (2 coins), which is already optimal.',
        },
        {
          id: 'seven',
          label: 'Amount 7: greedy takes a single 7, the obvious optimum.',
        },
        {
          id: 'never',
          label: 'Greedy never fails for {1, 5, 7} because the coin 1 is included.',
        },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['ten'] },
    hint: 'Try the amounts where the big 7-coin leaves an awkward remainder that the 1s must mop up. Compare leaning on 7 versus leaning on the 5s.',
    explanationOnWrong:
      'At amount 10 greedy grabs 7, then must pay the remaining 3 as 1 + 1 + 1 — four coins — while 5 + 5 makes 10 in two. (At 12, greedy\u2019s 7 + 5 is already optimal, and at 7 a single coin is best.) Having a 1-coin guarantees you CAN make any amount, but not that greedy makes it with the FEWEST coins.',
  },
  {
    id: 'rb-mcq-count-sum',
    type: 'checkpoint',
    difficulty: 3,
    component: 'MultipleChoice',
    props: {
      question:
        'When counting the number of ordered ways to climb with steps {1, 2}, how is ways[i] built from its look-backs?',
      options: [
        {
          id: 'sum',
          label: 'ways[i] = ways[i−1] + ways[i−2]: every predecessor contributes its own count.',
        },
        {
          id: 'or',
          label: 'ways[i] is True if ways[i−1] or ways[i−2] is non-zero.',
        },
        {
          id: 'min',
          label: 'ways[i] = 1 + min(ways[i−1], ways[i−2]).',
        },
        {
          id: 'max',
          label: 'ways[i] = max(ways[i−1], ways[i−2]).',
        },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['sum'] },
    hint: 'Each distinct last step gives a separate batch of paths. How do you total separate batches?',
    explanationOnWrong:
      'The paths ending in a 1-step and those ending in a 2-step are disjoint, so you ADD them: ways[i] = ways[i−1] + ways[i−2] (the Fibonacci recurrence). OR/min/max throw away the count — they answer feasibility or fewest, not "how many".',
  },
  {
    id: 'rb-mcq-plus-one-role',
    type: 'checkpoint',
    difficulty: 3,
    component: 'MultipleChoice',
    props: {
      question:
        'In best[a] = 1 + min over coins c of best[a − c], what is the role of the "+ 1"?',
      options: [
        {
          id: 'onecoin',
          label: 'It counts the single coin c you lay down now to drop from a to a − c.',
        },
        {
          id: 'offbyone',
          label: 'It is an off-by-one fix for 0-indexing the table.',
        },
        {
          id: 'basecase',
          label: 'It is the base case for amount 0.',
        },
        {
          id: 'coinvalue',
          label: 'It adds the value of coin c to the running total.',
        },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['onecoin'] },
    hint: 'best counts COINS, not values. What did you just spend to get from a − c to a?',
    explanationOnWrong:
      'best[·] counts coins. Moving from the solved subproblem a − c up to a costs exactly one coin (the coin c), so you add 1 to best[a − c]. It is not an indexing fix, not the base case (that is best[0] = 0), and it adds a coin COUNT of 1, not the coin\u2019s value.',
  },
  {
    id: 'rb-mcq-greedy-146',
    type: 'checkpoint',
    difficulty: 3,
    component: 'MultipleChoice',
    props: {
      question:
        'Greedy (always grab the largest coin that fits) is optimal for {1, 5, 10, 25} but not in general. For coins {1, 4, 6}, at which amount does greedy use MORE coins than necessary?',
      options: [
        { id: 'eight', label: 'Amount 8: greedy takes 6 + 1 + 1 (3 coins), but 4 + 4 needs only 2.' },
        { id: 'twelve', label: 'Amount 12: greedy takes 6 + 6 (2 coins), which is already optimal.' },
        { id: 'six', label: 'Amount 6: greedy takes a single 6, the obvious optimum.' },
        { id: 'never', label: 'Greedy never fails for {1, 4, 6} because the coin 1 is included.' },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['eight'] },
    hint: 'Look for an amount where grabbing the 6 leaves an awkward remainder the 1s must mop up, versus leaning on the 4s.',
    explanationOnWrong:
      'At amount 8 greedy grabs 6, then pays 2 as 1 + 1 — three coins — while 4 + 4 makes 8 in two. (At 12, greedy 6 + 6 is already optimal, and at 6 a single coin is best.) Having a 1-coin guarantees you CAN make any amount, but not with the FEWEST coins.',
  },
  // ---------- difficulty 4 ----------
  {
    id: 'rb-code-mincoins',
    type: 'checkpoint',
    difficulty: 4,
    component: 'CodeBlanks',
    props: {
      prompt:
        'The fewest-coins table, with more pieces hidden. Each amount lays one coin on top of the best smaller subproblem — but you must pick the right combine operator too.',
      codeLines: [
        [{ type: 'text', value: 'best = [INF] * (amount + 1)' }],
        [
          { type: 'text', value: 'best[0] = ' },
          { type: 'blank', id: 'seed' },
        ],
        [{ type: 'text', value: 'for a in range(1, amount + 1):' }],
        [{ type: 'text', value: '    for c in coins:' }],
        [{ type: 'text', value: '        if a - c >= 0:' }],
        [
          { type: 'text', value: '            best[a] = ' },
          { type: 'blank', id: 'op' },
          { type: 'text', value: '(best[a], ' },
          { type: 'blank', id: 'plus' },
          { type: 'text', value: ' + best[' },
          { type: 'blank', id: 'lookback' },
          { type: 'text', value: '])' },
        ],
      ],
      tokens: [
        { id: 'zero', label: '0' },
        { id: 'one', label: '1' },
        { id: 'aminusc', label: 'a - c' },
        { id: 'aplusc', label: 'a + c' },
        { id: 'c', label: 'c' },
        { id: 'min', label: 'min' },
        { id: 'max', label: 'max' },
      ],
    },
    validation: {
      type: 'codeBlanks',
      correct: { seed: 'zero', op: 'min', plus: 'one', lookback: 'aminusc' },
    },
    hint: 'It takes 0 coins to make amount 0. To make a you spend exactly 1 coin to drop to an earlier amount a − c, and you want the FEWEST coins overall.',
    explanationOnWrong:
      'Seed best[0] = 0. Laying one coin adds 1 to the cost of the subproblem a − c, so the candidate is 1 + best[a − c]. Because you want the fewest coins, combine with min (max would chase the most coins, and a + c looks forward past the target).',
  },
  {
    id: 'rb-mcq-coin-variants',
    type: 'checkpoint',
    difficulty: 4,
    component: 'MultipleChoice',
    props: {
      question:
        'Coin feasibility (can we make a?), coin counting (how many ways?), and fewest-coins all sweep the same amounts and read the same look-backs a − c. What is the ONE thing that genuinely distinguishes the three?',
      options: [
        {
          id: 'combine',
          label:
            'The combine step: OR the predecessors for feasibility, SUM them for counting, and take 1 + min for fewest coins.',
        },
        {
          id: 'order',
          label: 'The order the amounts are filled — feasibility goes top-down, the others bottom-up.',
        },
        {
          id: 'loops',
          label: 'Whether coins or amounts sit in the outer loop.',
        },
        {
          id: 'samecombine',
          label:
            'Only the base case differs (False, 0, INF); the combine step is identical across all three.',
        },
      ],
    },
    validation: { type: 'multipleChoice', correctIds: ['combine'] },
    hint: 'All three are bottom-up over the same states with the same predecessors. Focus on what each one DOES with those predecessors.',
    explanationOnWrong:
      'Same states, same look-backs, same bottom-up order, and even the loop nesting can match. What changes is the combine step: feasibility ORs the predecessors, counting SUMS them, and fewest-coins takes 1 + min. The base cases do differ too, but the claim that the combine step is identical is exactly the false part of that option.',
  },
];
