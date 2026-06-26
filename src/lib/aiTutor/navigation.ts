import type { Course, Lesson } from '../../types/content';
import type { NavigationTarget, ParsedReply, RawNavDirective } from './types';
import { slideContainsPhrase } from './slideText';

/** Longest reason/highlight we'll accept from the model (defensive bound). */
const MAX_FIELD = 240;

const NAV_BLOCK = /```tutor-nav\s*([\s\S]*?)```/i;

/**
 * Split a model reply into the user-visible text and an optional navigation
 * directive. The `tutor-nav` fenced block is stripped from the text so the
 * learner never sees raw JSON. Malformed JSON is treated as "no directive"
 * rather than throwing — a bad block must never break the chat.
 */
export function parseReply(reply: string): ParsedReply {
  const match = reply.match(NAV_BLOCK);
  if (!match) return { text: reply.trim(), directive: null };

  const text = reply.replace(NAV_BLOCK, '').trim();
  let directive: RawNavDirective | null = null;
  try {
    const parsed = JSON.parse(match[1].trim()) as unknown;
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      directive = {
        lessonId: typeof obj.lessonId === 'string' ? obj.lessonId : undefined,
        slideId: typeof obj.slideId === 'string' ? obj.slideId : undefined,
        reason: typeof obj.reason === 'string' ? obj.reason : undefined,
        highlight: typeof obj.highlight === 'string' ? obj.highlight : undefined,
      };
    }
  } catch {
    directive = null;
  }
  return { text, directive };
}

/**
 * A lesson is a valid navigation destination only if it exists in the course
 * and sits at or before the current lesson in order. This is the safety
 * boundary: the tutor can send a learner back for review, never forward into
 * not-yet-unlocked material.
 */
export function canNavigateToLesson(
  course: Course,
  currentLesson: Lesson,
  targetLessonId: string,
): boolean {
  const target = course.lessons.find((l) => l.id === targetLessonId);
  if (!target) return false;
  return target.order <= currentLesson.order;
}

/**
 * Resolve a raw directive into a concrete, validated target — or null if it's
 * unsafe or nonsensical (unknown lesson, forward/locked lesson, unknown slide).
 * Returning null means "ignore the suggestion", so a hallucinated id can never
 * navigate the learner anywhere.
 */
export function resolveNavigation(
  course: Course,
  currentLesson: Lesson,
  directive: RawNavDirective | null,
): NavigationTarget | null {
  // This decides whether the app *acts* on model output, so it must never
  // throw and must reject anything it isn't certain is safe (fail in place).
  try {
    if (!directive || !directive.lessonId || !directive.slideId) return null;
    if (!canNavigateToLesson(course, currentLesson, directive.lessonId)) return null;

    const lesson = course.lessons.find((l) => l.id === directive.lessonId);
    if (!lesson) return null;

    const slideIndex = lesson.slides.findIndex((s) => s.id === directive.slideId);
    if (slideIndex < 0) return null;

    // Ground the highlight in the truth source: only honor it when it appears
    // verbatim on the destination slide. A hallucinated phrase is dropped.
    const slide = lesson.slides[slideIndex];
    const rawHighlight = directive.highlight?.trim().slice(0, MAX_FIELD) ?? '';
    const highlight =
      rawHighlight && slideContainsPhrase(slide, rawHighlight)
        ? rawHighlight
        : undefined;

    const reason = directive.reason?.trim().slice(0, MAX_FIELD) || undefined;

    return {
      courseId: course.id,
      lessonId: lesson.id,
      slideIndex,
      lessonTitle: lesson.title,
      reason,
      highlight,
    };
  } catch {
    return null;
  }
}
