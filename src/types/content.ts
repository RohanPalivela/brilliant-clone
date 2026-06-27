// Content model for lessons. Matches PRD Section 11.2 slide schema.
// All answer/validation logic lives in slide config (not hardcoded in widgets),
// so the same widgets render any lesson and AI can generate lessons later.

export type SlideType =
  | 'prompt'
  | 'explore'
  | 'explain'
  | 'checkpoint'
  | 'celebrate';

export type ComponentType =
  | 'StairGrid'
  | 'ArrayRow'
  | 'StairsToArray'
  | 'StaircaseWalkthrough'
  | 'RangeSelector'
  | 'PredecessorPicker'
  | 'MultipleChoice'
  | 'CodeBlanks'
  | 'KnapsackPicker'
  | 'CoinBuilder'
  | 'PathBuilder'
  | 'MinChoicePicker'
  | 'DPTable'
  | 'CoinSweep'
  | 'SubproblemIsolation'
  | 'GreedyFailure'
  | 'CoinRecurrence'
  | 'CodeViewer'
  | 'RichText';

export type CellMark = 'empty' | 'check' | 'cross';

/** How reachability cells render their value: icons (✓/✗) or a 0/1 bit array. */
export type CellDisplay = 'icon' | 'binary';

export interface StairGridProps {
  /** Number of stairs above the ground. Positions are 0..steps (0 = ground). */
  steps: number;
  /** Allowed jump sizes, e.g. [3, 5]. */
  jumpSizes: number[];
  /** Target step the learner is trying to reach (for prompt copy / focus). */
  target?: number;
  /** When true the learner can toggle cells; false renders read-only. */
  editable?: boolean;
  prompt?: string;
  /** Cells that stay highlighted without interaction (e.g. a reveal's look-backs). */
  highlightIndices?: number[];
  /** Render the correct reachability map read-only (used by explain reveals). */
  showSolution?: boolean;
  /** Pre-fill + lock the correct answer for cells 0..prefillUpTo; learner finishes the rest. */
  prefillUpTo?: number;
  /** Show 0/1 instead of ✓/✗ glyphs. Defaults to 'icon'. */
  display?: CellDisplay;
  /** Draw dependency arrows from a cell's look-backs (i−j) to it on hover/highlight. */
  showArrows?: boolean;
  /** Always-on dependency arrows into these steps (i−j → i), independent of hover.
   *  Used for read-only diagrams that demonstrate the jumps. */
  arrowTargets?: number[];
  /** Play a hands-off looping reveal: verdicts appear step by step and the
   *  `arrowTargets`' look-back arrows draw in as each target is reached, then it
   *  restarts. Read-only diagram only. */
  loop?: boolean;
}

export interface ArrayRowProps {
  /** Number of indices: 0..steps. */
  steps: number;
  jumpSizes: number[];
  target?: number;
  editable?: boolean;
  prompt?: string;
  /** Cells that stay highlighted without interaction (e.g. a reveal's look-backs). */
  highlightIndices?: number[];
  /** Render the correct reachability map read-only (used by explain reveals). */
  showSolution?: boolean;
  /** Pre-fill + lock the correct answer for cells 0..prefillUpTo; learner finishes the rest. */
  prefillUpTo?: number;
  /** Show 0/1 instead of ✓/✗ glyphs. Defaults to 'binary' for ArrayRow. */
  display?: CellDisplay;
  /** Draw dependency arrows from a cell's look-backs (i−j) to it on hover/highlight. */
  showArrows?: boolean;
  /** Always-on dependency arrows into these indices (i−j → i), independent of hover.
   *  Used for read-only diagrams that demonstrate the look-backs. */
  arrowTargets?: number[];
  /** Play a hands-off looping reveal: verdicts appear index by index and the
   *  `arrowTargets`' look-back arrows draw in as each target is reached, then it
   *  restarts. Read-only diagram only. */
  loop?: boolean;
  /** Caption above the row, e.g. "reachable[]" or "can_make[]". */
  name?: string;
}

/**
 * Read-only "morph" visual: the staircase lies down to become a flat array of
 * cells. Used at the start of the array lesson to make the stairs↔array mapping
 * something the learner watches happen. Shows the solved reachability values.
 */
export interface StairsToArrayProps {
  steps: number;
  jumpSizes: number[];
  prompt?: string;
  /** Cells kept highlighted throughout the morph. */
  highlightIndices?: number[];
  /** Caption shown beneath the morph. */
  caption?: string;
}

/**
 * A self-paced worked example: the learner steps through the staircase one step
 * at a time (Prev/Next or ← →). Each frame decides one step, highlights it, draws
 * the look-back arrows into it, and narrates why it's reachable or not.
 */
export interface StaircaseWalkthroughProps {
  steps: number;
  jumpSizes: number[];
  prompt?: string;
  /** Caption shown beneath the stepper. */
  caption?: string;
}

export interface RangeSelectorProps {
  /** Number line spans min..max (inclusive). */
  min: number;
  max: number;
  /** The value F(target) the learner is reasoning about. */
  target: number;
  jumpSizes: number[];
  prompt?: string;
  /** A fixed goal shown highlighted on the line but not selectable by the handles. */
  goalIndex?: number;
}

/**
 * "Tap the cells this one depends on." The learner selects the exact earlier
 * cells that decide `target` — its look-backs `target − j` for each jump `j`.
 * Unlike RangeSelector (a contiguous window), this works for any jump set,
 * including non-contiguous ones like {3, 5} where the dependencies are
 * scattered, not adjacent. It isolates the recurrence: you can't answer it by
 * simulating jumps forward, only by reasoning backward from predecessors.
 *
 * Reuses the `range` answer/validation shape: the answer is the set of selected
 * indices, validated against `lookbackIndices(target, jumpSizes)`.
 */
export interface PredecessorPickerProps {
  /** Row length: cells 0..steps. Make this a few above `target` so there are
   *  forward cells to (incorrectly) consider — "look backward, not forward". */
  steps: number;
  jumpSizes: number[];
  /** The cell whose dependencies the learner selects (highlighted, locked). */
  target: number;
  prompt?: string;
  /** 'stairs' (rising heights) or 'array' (flat squares). Defaults to 'array'. */
  variant?: 'stairs' | 'array';
  /** Optional array label shown above the row, e.g. 'can_make[]'. */
  name?: string;
  /** What the move sizes are called in copy: 'jumps' (default) or 'coins'. */
  moveLabel?: string;
  /** Caption shown beneath the row. */
  caption?: string;
}

export interface MultipleChoiceOption {
  id: string;
  label: string;
}

export interface MultipleChoiceProps {
  question: string;
  options: MultipleChoiceOption[];
  multiSelect?: boolean;
}

export interface RichTextVisual {
  component: 'StairGrid' | 'ArrayRow' | 'ForwardExplosion' | 'FibonacciSequence';
  /** Stairs/array length for grid reveals. Unused by ForwardExplosion. */
  steps?: number;
  jumpSizes: number[];
  /** Cells to keep highlighted on the read-only reveal grid. */
  highlightIndices?: number[];
  /** Draw dependency arrows from a cell's look-backs (i−j) on hover/highlight. */
  showArrows?: boolean;
  /** Always-on look-back arrows into these indices on the reveal grid. */
  arrowTargets?: number[];
  /** Play the hands-off looping reveal on the grid (verdicts + arrows accrue). */
  loop?: boolean;
  /** Show 0/1 instead of ✓/✗ glyphs on the reveal grid. */
  display?: CellDisplay;
  /** ForwardExplosion only: how many times the forward paths branch. */
  depth?: number;
  /** FibonacciSequence only: number of terms to build (default 7). */
  count?: number;
  /** FibonacciSequence only: the first two terms (default [0, 1]). */
  seeds?: [number, number];
  /** FibonacciSequence only: letter used for cell sub-labels, e.g. 'F'. */
  label?: string;
  /** FibonacciSequence only: index shown for the first cell's sub-label. */
  startIndex?: number;
  /** Caption shown beneath the visual. */
  caption?: string;
}

/** One language tab in the CodeViewer editor panel. */
export interface CodeViewerTab {
  id: string;
  /** Tab label, e.g. 'Python'. */
  label: string;
  /** File extension shown in the title bar, e.g. 'py'. */
  language: string;
  code: string;
}

/**
 * A read-only code panel styled like an editor window (traffic-light dots,
 * filename, language tabs, numbered monospace body). Purely presentational.
 */
export interface CodeViewerProps {
  /** Filename without extension; the active tab's `language` is appended. */
  filename?: string;
  tabs: CodeViewerTab[];
  prompt?: string;
}

/** One token in a line of code: literal text or a fill-in-the-blank slot. */
export type CodeToken =
  | { type: 'text'; value: string }
  | { type: 'blank'; id: string };

export interface CodeBlanksOption {
  id: string;
  label: string;
}

export interface CodeBlanksProps {
  /** Code rendered line by line; each line is a sequence of literal text and blanks. */
  codeLines: CodeToken[][];
  /** Draggable/tappable tokens the learner places into the blanks. */
  tokens: CodeBlanksOption[];
  prompt?: string;
}

/**
 * A read-only, looping schematic that names the "isolate the subproblem" idea:
 * five steps sit in a row, and the rightmost (the goal) is decided only by the
 * two steps it could be reached from. One predecessor is reachable (green, valid
 * arrow), the other is a dead end (red, invalid arrow), and the steps in between
 * stay unknown because they don't affect the goal. The goal then resolves to ✓.
 */
export interface SubproblemIsolationProps {
  prompt?: string;
  /** Caption shown beneath the diagram. */
  caption?: string;
}

/**
 * A read-only, looping comparison that shows why greedy fails for min-coin
 * change: the greedy lane grabs the biggest coin first and ends with more
 * coins than the optimal lane, with a count badge on each so the difference is
 * impossible to miss.
 */
export interface GreedyFailureProps {
  /** Coin denominations available, e.g. [1, 3, 4]. */
  coins: number[];
  /** Target amount being made, e.g. 6. */
  amount: number;
  /** Coins greedy grabs, biggest-first, e.g. [4, 1, 1]. */
  greedyPick: number[];
  /** The fewest-coins solution, e.g. [3, 3]. */
  optimalPick: number[];
  prompt?: string;
  /** Caption shown beneath the diagram. */
  caption?: string;
}

/**
 * A read-only, looping schematic of the min-coins recurrence: the goal Z
 * depends on two already-solved subproblems (Z − X and Z − Y) with known
 * costs. It marks the cheaper one, adds a single coin along that arrow, and
 * resolves Z to 1 + the smaller cost.
 */
export interface CoinRecurrenceProps {
  /** Label for the first coin denomination, e.g. 'X'. Defaults to 'X'. */
  coinXLabel?: string;
  /** Label for the second coin denomination, e.g. 'Y'. Defaults to 'Y'. */
  coinYLabel?: string;
  /** Known fewest coins for the Z − X subproblem. Defaults to 5. */
  costX?: number;
  /** Known fewest coins for the Z − Y subproblem. Defaults to 4. */
  costY?: number;
  prompt?: string;
  /** Caption shown beneath the diagram. */
  caption?: string;
}

export interface RichTextProps {
  heading?: string;
  body?: string;
  bullets?: string[];
  emphasis?: string;
  pseudocode?: string;
  /** When true, render `body` before the highlighted `emphasis` (calm setup
   *  first, punchy takeaway second). Defaults to emphasis-first. */
  bodyFirst?: boolean;
  /** Optional read-only solved grid shown beneath the text (a visual reveal). */
  visual?: RichTextVisual;
}

/** A loot item for the 0/1 knapsack widget. */
export interface KnapsackItem {
  id: string;
  label: string;
  weight: number;
  value: number;
}

export interface KnapsackPickerProps {
  items: KnapsackItem[];
  /** Weight budget. The bag can never exceed this. */
  capacity: number;
  prompt?: string;
  /** Reveal the best achievable value as a target line (explore mode). */
  showOptimal?: boolean;
}

/**
 * "Build the amount." The learner taps coin buttons to drop coins into a tray,
 * accumulating toward a target. A construction mechanic — the opposite of
 * classifying cells: you assemble a concrete solution and watch the running
 * total. In `fewest` mode success also requires using the minimum number of
 * coins, so the learner feels the optimization the table later automates.
 */
export interface CoinBuilderProps {
  /** Coin denominations the learner can tap, e.g. [3, 5]. */
  coins: number[];
  /** The amount to build exactly. */
  target: number;
  /** When true, hitting the target only counts if it uses the fewest coins. */
  fewest?: boolean;
  /** Show the fewest-possible-coins goal as a target line. */
  showFewest?: boolean;
  prompt?: string;
  /** Caption shown beneath the tray. */
  caption?: string;
}

/**
 * "Build a path." The learner appends jumps (e.g. +3 / +7) and a climber walks
 * up the staircase, landing exactly on `target` or overshooting. A sequence-
 * construction mechanic: you reason *forward* by assembling an ordered list of
 * moves, the complement to the backward look-back the table uses. Overshooting
 * is blocked so the only way to win is to land precisely.
 */
export interface PathBuilderProps {
  /** Allowed jump sizes the learner can append, e.g. [3, 7]. */
  jumpSizes: number[];
  /** Step the climber must land on exactly. */
  target: number;
  /** Tallest step drawn; defaults to `target`. Keep >= target. */
  height?: number;
  prompt?: string;
  /** Caption shown beneath the staircase. */
  caption?: string;
}

/**
 * "Pick the cheapest first coin." For optimization DP: the amount Z is shown
 * with one card per coin, each revealing the already-solved cost of the
 * subproblem Z − coin. The learner chooses which single coin to lay down first
 * — i.e. which predecessor subproblem minimizes 1 + best[Z − coin]. A
 * comparative-selection mechanic that isolates the argmin at the heart of the
 * min-coins recurrence. Reuses the `choice` answer shape (option id = `c<coin>`).
 */
export interface MinChoicePickerProps {
  /** Coin denominations available, e.g. [1, 3, 4]. */
  coins: number[];
  /** The amount Z whose first coin the learner is choosing. */
  amount: number;
  prompt?: string;
  /** Caption shown beneath the cards. */
  caption?: string;
}

/**
 * Animated "watch the algorithm run" table. Read-only: it fills bottom-up so
 * learners see the recurrence execute. Three flavors share one widget.
 */
export type DPTableProps =
  | {
      mode: 'reachability';
      steps: number;
      jumpSizes: number[];
      /** Show 0/1 instead of ✓/✗ glyphs (to match the reachable[] array view). */
      display?: CellDisplay;
      prompt?: string;
      caption?: string;
    }
  | {
      mode: 'coins';
      coins: number[];
      amount: number;
      prompt?: string;
      caption?: string;
    }
  | {
      mode: 'knapsack';
      items: KnapsackItem[];
      capacity: number;
      prompt?: string;
      caption?: string;
    };

/**
 * Animated, read-only "watch it run" sweep of coin-change feasibility. Fills
 * can_make[] bottom-up — the staircase reachability sweep with coins as the
 * jumps and amounts as the steps — drawing each amount's look-backs (amount −
 * coin) and narrating which coin lands it. Auto-plays with scrub controls.
 */
export interface CoinSweepProps {
  /** Coin denominations available, e.g. [2, 5]. */
  coins: number[];
  /** Highest amount swept; the row spans 0..amount. */
  amount: number;
  prompt?: string;
  /** Caption shown beneath the sweep. */
  caption?: string;
}

export type Validation =
  | { type: 'none' }
  | { type: 'reachability'; jumpSizes: number[]; steps: number; target?: number }
  | { type: 'multipleChoice'; correctIds: string[] }
  | { type: 'range'; correctIndices: number[] }
  | { type: 'codeBlanks'; correct: Record<string, string> }
  | { type: 'knapsack'; capacity: number; items: KnapsackItem[] }
  | { type: 'coinSum'; coins: number[]; target: number; fewest?: boolean }
  | { type: 'jumpPath'; jumpSizes: number[]; target: number }
  | { type: 'minCoinChoice'; coins: number[]; amount: number };

interface BaseSlide {
  id: string;
  type: SlideType;
  hint?: string;
  explanationOnWrong?: string;
  /** Authored difficulty rubric, 1 (trivial) → 5 (hard). Used to seed review
   *  pools in an ascending easy→hard ramp. Missing defaults to 3. */
  difficulty?: number;
}

export type Slide =
  | (BaseSlide & { component: 'StairGrid'; props: StairGridProps; validation?: Validation })
  | (BaseSlide & { component: 'ArrayRow'; props: ArrayRowProps; validation?: Validation })
  | (BaseSlide & { component: 'StairsToArray'; props: StairsToArrayProps; validation?: Validation })
  | (BaseSlide & { component: 'StaircaseWalkthrough'; props: StaircaseWalkthroughProps; validation?: Validation })
  | (BaseSlide & { component: 'RangeSelector'; props: RangeSelectorProps; validation?: Validation })
  | (BaseSlide & { component: 'PredecessorPicker'; props: PredecessorPickerProps; validation?: Validation })
  | (BaseSlide & { component: 'MultipleChoice'; props: MultipleChoiceProps; validation?: Validation })
  | (BaseSlide & { component: 'CodeBlanks'; props: CodeBlanksProps; validation?: Validation })
  | (BaseSlide & { component: 'KnapsackPicker'; props: KnapsackPickerProps; validation?: Validation })
  | (BaseSlide & { component: 'CoinBuilder'; props: CoinBuilderProps; validation?: Validation })
  | (BaseSlide & { component: 'PathBuilder'; props: PathBuilderProps; validation?: Validation })
  | (BaseSlide & { component: 'MinChoicePicker'; props: MinChoicePickerProps; validation?: Validation })
  | (BaseSlide & { component: 'DPTable'; props: DPTableProps; validation?: Validation })
  | (BaseSlide & { component: 'CoinSweep'; props: CoinSweepProps; validation?: Validation })
  | (BaseSlide & { component: 'SubproblemIsolation'; props: SubproblemIsolationProps; validation?: Validation })
  | (BaseSlide & { component: 'GreedyFailure'; props: GreedyFailureProps; validation?: Validation })
  | (BaseSlide & { component: 'CoinRecurrence'; props: CoinRecurrenceProps; validation?: Validation })
  | (BaseSlide & { component: 'RichText'; props: RichTextProps; validation?: Validation })
  | (BaseSlide & { component: 'CodeViewer'; props: CodeViewerProps; validation?: Validation });

/** A learner's answer for a slide, shape depends on the widget. */
export type SlideAnswer =
  | { kind: 'cells'; marks: CellMark[] }
  | { kind: 'choice'; selectedIds: string[] }
  | { kind: 'range'; indices: number[] }
  | { kind: 'blanks'; filled: Record<string, string> }
  | { kind: 'items'; selectedIds: string[] }
  | { kind: 'coins'; picks: number[] }
  | { kind: 'path'; jumps: number[] }
  | { kind: 'none' };

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  slides: Slide[];
}

export interface Course {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  subject: 'computer-science';
  difficulty: Difficulty;
  estimatedMinutes: number;
  lessonOrder: string[];
  lessons: Lesson[];
}
