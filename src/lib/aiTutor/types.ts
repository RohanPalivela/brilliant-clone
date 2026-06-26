// Shared types for the AI tutor feature. Kept free of React / Firebase imports
// so the pure pieces (context, solution, navigation, client) stay easy to test.

import type { Slide, SlideAnswer } from '../../types/content';

/** A single turn in the tutor conversation. `system` is never shown in the UI. */
export interface TutorMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Runtime configuration resolved from Vite env vars. */
export interface TutorConfig {
  /** Whether the tutor UI is turned on for this build. */
  enabled: boolean;
  /** Same-origin path of the server proxy that holds the real API key. */
  endpoint: string;
  /** Chat model slug (not a secret) — shapes the outgoing request body. */
  model: string;
}

/**
 * A compact, ground-truthed description of one slide's correct answer. This is
 * fed to the model so its guidance is accurate, but the system prompt forbids
 * it from ever revealing the answer on a gated activity.
 */
export interface SlideSolution {
  /** True when the slide is a graded activity the learner must answer. */
  isActivity: boolean;
  /** One-line plain-English statement of the correct answer (ground truth). */
  answerSummary: string;
  /** The reasoning/process a learner should follow — safe to coach toward. */
  reasoning?: string;
}

/** Everything the tutor knows about the learner's current position. */
export interface TutorContext {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  /** 0-based index of the slide on screen. */
  slideIndex: number;
  totalSlides: number;
  slide: Slide;
  /** What the learner has currently entered for this slide. */
  answer: SlideAnswer;
  /** Whether the learner has already answered this slide correctly. */
  solvedCorrectly: boolean;
  solution: SlideSolution;
  /** Slides the tutor may reference / navigate to, in lesson order. */
  reachableSlides: ReachableSlide[];
  /** Titles (no content) of not-yet-unlocked lessons, so the tutor can give an
   *  accurate "this comes up later" teaser without spoiling or navigating there. */
  upcomingLessons: UpcomingLesson[];
}

/**
 * A future, still-locked lesson the tutor knows is coming. Only its title and
 * order are exposed — never its slide content — so the tutor can name the topic
 * as a teaser but cannot reveal or jump into locked material.
 */
export interface UpcomingLesson {
  lessonOrder: number;
  lessonTitle: string;
}

/** A slide the tutor is allowed to send the learner to (current + earlier lessons). */
export interface ReachableSlide {
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  slideId: string;
  slideIndex: number;
  /** Short human label, e.g. "L1 · 3 · MultipleChoice". */
  label: string;
  /** Heading/prompt snippet to help the model pick the right one. */
  summary: string;
  /** The slide's full rendered text, so the tutor can reference earlier
   *  lessons accurately (and only quote things that actually exist). */
  text: string;
}

/** A concrete, validated place to send the learner. */
export interface NavigationTarget {
  courseId: string;
  lessonId: string;
  slideIndex: number;
  /** Lesson title for UI labels. */
  lessonTitle: string;
  /** Why the tutor suggested going here (shown on the button). */
  reason?: string;
  /** An exact phrase from the destination slide to spotlight for the learner. */
  highlight?: string;
}

/** Where the learner was before a tutor-initiated jump, so they can return. */
export interface ReturnPoint {
  courseId: string;
  lessonId: string;
  slideIndex: number;
  lessonTitle: string;
}

/** The raw navigation directive the model may emit inside a ```tutor-nav block. */
export interface RawNavDirective {
  lessonId?: string;
  slideId?: string;
  reason?: string;
  /** Optional exact phrase from the target slide to spotlight on arrival. */
  highlight?: string;
}

/** Result of parsing a model reply: the user-visible text plus any nav directive. */
export interface ParsedReply {
  /** Reply text with any tutor-nav block stripped out. */
  text: string;
  directive: RawNavDirective | null;
}

/** One chat bubble in the tutor UI. Distinct from the API `TutorMessage`. */
export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** A confirmed-by-tap navigation the tutor proposed alongside this reply. */
  nav?: NavigationTarget;
  /** Assistant turn still streaming. */
  pending?: boolean;
  /** This turn failed (e.g. network/config error). */
  error?: boolean;
}
