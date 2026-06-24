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
  component: 'StairGrid' | 'ArrayRow' | 'ForwardExplosion';
  /** Stairs/array length for grid reveals. Unused by ForwardExplosion. */
  steps?: number;
  jumpSizes: number[];
  /** Cells to keep highlighted on the read-only reveal grid. */
  highlightIndices?: number[];
  /** Show 0/1 instead of ✓/✗ glyphs on the reveal grid. */
  display?: CellDisplay;
  /** ForwardExplosion only: how many times the forward paths branch. */
  depth?: number;
  /** Caption shown beneath the visual. */
  caption?: string;
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
  | (BaseSlide & { component: 'RichText'; props: RichTextProps; validation?: Validation });

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
