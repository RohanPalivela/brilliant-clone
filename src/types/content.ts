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
  | 'MultipleChoice'
  | 'CodeBlanks'
  | 'KnapsackPicker'
  | 'DPTable'
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
 * Animated "watch the algorithm run" table. Read-only: it fills bottom-up so
 * learners see the recurrence execute. Three flavors share one widget.
 */
export type DPTableProps =
  | {
      mode: 'reachability';
      steps: number;
      jumpSizes: number[];
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

export type Validation =
  | { type: 'none' }
  | { type: 'reachability'; jumpSizes: number[]; steps: number; target?: number }
  | { type: 'multipleChoice'; correctIds: string[] }
  | { type: 'range'; correctIndices: number[] }
  | { type: 'codeBlanks'; correct: Record<string, string> }
  | { type: 'knapsack'; capacity: number; items: KnapsackItem[] };

interface BaseSlide {
  id: string;
  type: SlideType;
  hint?: string;
  explanationOnWrong?: string;
}

export type Slide =
  | (BaseSlide & { component: 'StairGrid'; props: StairGridProps; validation?: Validation })
  | (BaseSlide & { component: 'ArrayRow'; props: ArrayRowProps; validation?: Validation })
  | (BaseSlide & { component: 'StairsToArray'; props: StairsToArrayProps; validation?: Validation })
  | (BaseSlide & { component: 'StaircaseWalkthrough'; props: StaircaseWalkthroughProps; validation?: Validation })
  | (BaseSlide & { component: 'RangeSelector'; props: RangeSelectorProps; validation?: Validation })
  | (BaseSlide & { component: 'MultipleChoice'; props: MultipleChoiceProps; validation?: Validation })
  | (BaseSlide & { component: 'CodeBlanks'; props: CodeBlanksProps; validation?: Validation })
  | (BaseSlide & { component: 'KnapsackPicker'; props: KnapsackPickerProps; validation?: Validation })
  | (BaseSlide & { component: 'DPTable'; props: DPTableProps; validation?: Validation })
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
