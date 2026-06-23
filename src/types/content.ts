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
  | 'RangeSelector'
  | 'MultipleChoice'
  | 'CodeBlanks'
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
  component: 'StairGrid' | 'ArrayRow';
  steps: number;
  jumpSizes: number[];
  /** Cells to keep highlighted on the read-only reveal grid. */
  highlightIndices?: number[];
  /** Show 0/1 instead of ✓/✗ glyphs on the reveal grid. */
  display?: CellDisplay;
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

export interface RichTextProps {
  heading?: string;
  body?: string;
  bullets?: string[];
  emphasis?: string;
  pseudocode?: string;
  /** Optional read-only solved grid shown beneath the text (a visual reveal). */
  visual?: RichTextVisual;
}

export type Validation =
  | { type: 'none' }
  | { type: 'reachability'; jumpSizes: number[]; steps: number; target?: number }
  | { type: 'multipleChoice'; correctIds: string[] }
  | { type: 'range'; correctIndices: number[] }
  | { type: 'codeBlanks'; correct: Record<string, string> };

interface BaseSlide {
  id: string;
  type: SlideType;
  hint?: string;
  explanationOnWrong?: string;
}

export type Slide =
  | (BaseSlide & { component: 'StairGrid'; props: StairGridProps; validation?: Validation })
  | (BaseSlide & { component: 'ArrayRow'; props: ArrayRowProps; validation?: Validation })
  | (BaseSlide & { component: 'RangeSelector'; props: RangeSelectorProps; validation?: Validation })
  | (BaseSlide & { component: 'MultipleChoice'; props: MultipleChoiceProps; validation?: Validation })
  | (BaseSlide & { component: 'CodeBlanks'; props: CodeBlanksProps; validation?: Validation })
  | (BaseSlide & { component: 'RichText'; props: RichTextProps; validation?: Validation });

/** A learner's answer for a slide, shape depends on the widget. */
export type SlideAnswer =
  | { kind: 'cells'; marks: CellMark[] }
  | { kind: 'choice'; selectedIds: string[] }
  | { kind: 'range'; indices: number[] }
  | { kind: 'blanks'; filled: Record<string, string> }
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
