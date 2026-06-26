import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, Lightbulb, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import type { Course, Lesson, Slide, SlideAnswer } from '../../types/content';
import type { NavigationTarget } from '../../lib/aiTutor/types';
import { defaultAnswer } from '../../lib/answers';
import { validateAnswer } from '../../lib/validation';
import {
  saveSlideProgress,
  completeLesson,
  recordProblemSolved,
  type LessonCompletionResult,
} from '../../data/progressService';
import { useAuth } from '../../hooks/useAuth';
import { useTutor } from '../../hooks/useTutor';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { FeedbackBanner, type FeedbackState } from '../ui/FeedbackBanner';
import { SlideView } from './SlideView';
import { CongratsScreen } from './CongratsScreen';
import { TutorWidget } from '../tutor/TutorWidget';
import { TutorReturnPill } from '../tutor/TutorReturnPill';

interface LessonPlayerProps {
  course: Course;
  lesson: Lesson;
  initialSlideIndex: number;
  initialCompletedSlideIds: string[];
  /** Furthest slide genuinely reached (drives saved progress). Defaults to the
   *  initial slide. Set separately from `initialSlideIndex` so a tutor "review"
   *  jump can open a deep slide without inflating saved progress. */
  initialMaxReached?: number;
  /** When true the player is a read-only review visit (e.g. the tutor sent the
   *  learner back to an earlier lesson): no progress is written or completed. */
  reviewMode?: boolean;
  /** A phrase to spotlight on the initial slide (set when the tutor jumped here
   *  across lessons with a highlight). */
  initialHighlight?: string;
}

function requiresAnswer(slide: Slide): boolean {
  return (
    (slide.type === 'prompt' || slide.type === 'checkpoint') &&
    !!slide.validation &&
    slide.validation.type !== 'none'
  );
}

const CORRECT_MESSAGE = 'Exactly — nice work!';

export function LessonPlayer({
  course,
  lesson,
  initialSlideIndex,
  initialCompletedSlideIds,
  initialMaxReached,
  reviewMode = false,
  initialHighlight,
}: LessonPlayerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { returnPoint, setReturnPoint } = useTutor();

  const total = lesson.slides.length;
  const startIndex = Math.min(Math.max(0, initialSlideIndex), total - 1);

  // Direction of the last navigation: +1 forward, -1 back. Drives slide motion.
  const [dir, setDir] = useState(1);
  const [slideIndex, setSlideIndex] = useState(startIndex);
  // Furthest slide the student has *genuinely* reached (via Continue). Going
  // backwards — or being sent to a slide by the tutor — never raises this, so
  // peeking/reviewing can't rewind or inflate saved progress.
  const [maxReached, setMaxReached] = useState(
    Math.min(Math.max(0, initialMaxReached ?? startIndex), total - 1),
  );
  // Slide the learner was on before a *same-lesson* tutor jump, so they can
  // return. Cross-lesson jumps use the shared `returnPoint` instead.
  const [localReturn, setLocalReturn] = useState<number | null>(null);
  // A phrase the tutor asked to spotlight, pinned to the slide it belongs to so
  // it only shows on that slide and never leaks onto others.
  const [highlight, setHighlight] = useState<{ slideIndex: number; text: string } | null>(
    initialHighlight ? { slideIndex: startIndex, text: initialHighlight } : null,
  );
  const [answers, setAnswers] = useState<Record<string, SlideAnswer>>({});
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(initialCompletedSlideIds),
  );
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<LessonCompletionResult | null>(null);
  const counted = useRef<Set<string>>(new Set());

  const slide = lesson.slides[slideIndex];
  const answer = answers[slide.id] ?? defaultAnswer(slide);
  const gated = requiresAnswer(slide);

  // Reset per-slide UI state on slide change; treat already-completed gated
  // slides (e.g. on resume or when revisiting) as solved so we show Continue,
  // not Check. Also track the furthest slide reached.
  useEffect(() => {
    const already = completed.has(slide.id) && gated;
    setChecked(already);
    setIsCorrect(already);
    setHintOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex]);

  // Mirror the latest progress into a ref so the exit-flush below can save it
  // without re-subscribing on every change.
  const latest = useRef({ maxReached, completed, finished });
  latest.current = { maxReached, completed, finished };

  // Debounced auto-save of position + completed slides. We persist the furthest
  // slide reached (not the current view), so going back to recap a lesson never
  // rewinds where the student resumes from.
  useEffect(() => {
    if (!user || finished || reviewMode) return;
    const t = setTimeout(() => {
      void saveSlideProgress(
        user.uid,
        course,
        lesson,
        maxReached,
        Array.from(completed),
      );
    }, 500);
    return () => clearTimeout(t);
  }, [user, course, lesson, maxReached, completed, finished, reviewMode]);

  // Flush the latest position when leaving the lesson. The debounce above is
  // cancelled on unmount, so without this, closing right after advancing would
  // discard that last step and the lesson would reopen at the start. Skip when
  // finished — completeLesson() already wrote the final, completed state and we
  // must not merge it back to "in_progress".
  useEffect(() => {
    if (!user || reviewMode) return;
    return () => {
      if (latest.current.finished) return;
      void saveSlideProgress(
        user.uid,
        course,
        lesson,
        latest.current.maxReached,
        Array.from(latest.current.completed),
      );
    };
  }, [user, course, lesson, reviewMode]);

  const setAnswer = useCallback(
    (a: SlideAnswer) => {
      setAnswers((prev) => ({ ...prev, [slide.id]: a }));
      // A fresh answer invalidates the previous check.
      setChecked(false);
      setIsCorrect(false);
    },
    [slide.id],
  );

  const markComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleCheck = () => {
    const correct = validateAnswer(slide.validation, answer);
    setChecked(true);
    setIsCorrect(correct);
    setHintOpen(false);
    if (correct) {
      markComplete(slide.id);
      if (!counted.current.has(slide.id)) {
        counted.current.add(slide.id);
        setProblemsSolved((n) => n + 1);
        if (user && !reviewMode) void recordProblemSolved(user.uid);
      }
    }
  };

  const finishLesson = useCallback(async () => {
    markComplete(slide.id);
    if (user && !reviewMode) {
      const res = await completeLesson(user.uid, course, lesson);
      setResult(res);
    } else {
      setResult({
        streakExtended: false,
        newStreak: 0,
        percentComplete: 100,
        alreadyCompleted: false,
      });
    }
    setFinished(true);
  }, [user, course, lesson, slide.id, markComplete, reviewMode]);

  const handleAdvance = () => {
    markComplete(slide.id);
    setHighlight(null);
    if (slideIndex < total - 1) {
      setDir(1);
      const next = slideIndex + 1;
      setSlideIndex(next);
      // Only genuine forward motion raises saved progress.
      setMaxReached((m) => Math.max(m, next));
    } else {
      void finishLesson();
    }
  };

  const handleBack = () => {
    setDir(-1);
    setHighlight(null);
    setSlideIndex((i) => Math.max(0, i - 1));
  };

  // The tutor proposes a destination the learner confirms. Same-lesson jumps
  // move in place (preserving in-progress answers) and remember where to return;
  // cross-lesson jumps stash a shared return point and route to a review visit.
  const handleTutorNavigate = useCallback(
    (target: NavigationTarget) => {
      if (target.lessonId === lesson.id) {
        const dest = Math.min(Math.max(0, target.slideIndex), total - 1);
        setLocalReturn((cur) => (cur === null ? slideIndex : cur));
        setDir(target.slideIndex >= slideIndex ? 1 : -1);
        setSlideIndex(dest);
        setHighlight(target.highlight ? { slideIndex: dest, text: target.highlight } : null);
      } else {
        setReturnPoint({
          courseId: course.id,
          lessonId: lesson.id,
          slideIndex,
          lessonTitle: lesson.title,
        });
        navigate(`/courses/${course.id}/lessons/${target.lessonId}`, {
          state: {
            tutorInitialSlide: target.slideIndex,
            review: true,
            tutorHighlight: target.highlight,
          },
        });
      }
    },
    [course, lesson, slideIndex, total, navigate, setReturnPoint],
  );

  const handleReturn = useCallback(() => {
    if (localReturn !== null) {
      setDir(-1);
      setHighlight(null);
      setSlideIndex(localReturn);
      setLocalReturn(null);
      return;
    }
    if (returnPoint) {
      const point = returnPoint;
      setReturnPoint(null);
      navigate(`/courses/${point.courseId}/lessons/${point.lessonId}`, {
        state: { tutorInitialSlide: point.slideIndex, review: false },
      });
    }
  }, [localReturn, returnPoint, navigate, setReturnPoint]);

  const dismissReturn = useCallback(() => {
    setLocalReturn(null);
    setReturnPoint(null);
  }, [setReturnPoint]);

  // Show the return pill for a same-lesson peek, or after arriving from a
  // cross-lesson jump (the shared return point points back to another lesson).
  const showReturnPill =
    localReturn !== null || (!!returnPoint && returnPoint.lessonId !== lesson.id);
  const returnLabel =
    localReturn !== null
      ? `Back to step ${localReturn + 1}`
      : returnPoint
        ? `Back to ${returnPoint.lessonTitle}`
        : '';

  const goNextLesson = () => {
    const idx = course.lessons.findIndex((l) => l.id === lesson.id);
    const after = course.lessons[idx + 1];
    if (after) navigate(`/courses/${course.id}/lessons/${after.id}`);
    else navigate(`/courses/${course.id}`);
  };

  const feedback: { state: FeedbackState; message: string } = useMemo(() => {
    if (hintOpen && slide.hint) return { state: 'hint', message: slide.hint };
    if (checked && isCorrect) return { state: 'correct', message: CORRECT_MESSAGE };
    if (checked && !isCorrect)
      return {
        state: 'wrong',
        message:
          slide.explanationOnWrong ?? 'Not quite — take another look and try again.',
      };
    return { state: null, message: '' };
  }, [hintOpen, checked, isCorrect, slide]);

  if (finished && result) {
    const idx = course.lessons.findIndex((l) => l.id === lesson.id);
    const nextLesson = course.lessons[idx + 1];
    return (
      <CongratsScreen
        course={course}
        lesson={lesson}
        problemsSolved={problemsSolved}
        percentComplete={result.percentComplete}
        newStreak={result.newStreak}
        nextLesson={nextLesson}
        onNextLesson={goNextLesson}
        onBackToCourse={() => navigate(`/courses/${course.id}`)}
      />
    );
  }

  const showCheck = gated && !isCorrect;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <AnimatePresence>
        {showReturnPill && (
          <TutorReturnPill
            label={returnLabel}
            onReturn={handleReturn}
            onDismiss={dismissReturn}
          />
        )}
      </AnimatePresence>

      {/* Minimal chrome header */}
      <header className="sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <button
            type="button"
            aria-label="Close lesson"
            onClick={() => navigate(`/courses/${course.id}`)}
            className="rounded-full p-1.5 text-muted hover:bg-canvas hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="flex-1 truncate text-sm font-semibold text-ink">
            {lesson.title}
          </span>
          <span className="text-xs font-medium tabular-nums text-muted">
            {slideIndex + 1} / {total}
          </span>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-3">
          <ProgressBar value={slideIndex + 1} max={total} segments={total} />
        </div>
      </header>

      {/* Slide body */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center overflow-hidden px-4 py-8">
        <motion.div
          key={slide.id}
          initial={reduce ? false : { x: dir * 48, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: 'easeOut' }}
        >
          <SlideView
            slide={slide}
            answer={answer}
            onAnswer={setAnswer}
            showMistakes={checked && !isCorrect}
            highlight={
              highlight && highlight.slideIndex === slideIndex
                ? highlight.text
                : undefined
            }
          />
        </motion.div>
      </main>

      {/* Footer: feedback + actions */}
      <footer className="sticky bottom-0 border-t border-line bg-surface">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {feedback.state && (
            <div className="mb-3">
              <FeedbackBanner state={feedback.state} message={feedback.message} />
            </div>
          )}
          <div className="flex items-center gap-3">
            {slideIndex > 0 && (
              <Button variant="ghost" onClick={handleBack} aria-label="Previous slide">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
            )}
            {slide.hint && !isCorrect && (
              <Button
                variant="ghost"
                onClick={() => setHintOpen((v) => !v)}
                aria-pressed={hintOpen}
              >
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                Hint
              </Button>
            )}
            <div className="flex-1" />
            {showCheck ? (
              <Button size="lg" onClick={handleCheck}>
                <Check className="h-4 w-4" aria-hidden="true" />
                Check
              </Button>
            ) : (
              <Button size="lg" onClick={handleAdvance}>
                {slideIndex < total - 1 ? 'Continue' : 'Finish lesson'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </footer>

      <TutorWidget
        course={course}
        lesson={lesson}
        slideIndex={slideIndex}
        answer={answer}
        solvedCorrectly={completed.has(slide.id)}
        onNavigate={handleTutorNavigate}
      />
    </div>
  );
}
