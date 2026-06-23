import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lightbulb, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import type { Course, Lesson, Slide, SlideAnswer } from '../../types/content';
import { defaultAnswer } from '../../lib/answers';
import { validateAnswer } from '../../lib/validation';
import {
  saveSlideProgress,
  completeLesson,
  recordProblemSolved,
  type LessonCompletionResult,
} from '../../data/progressService';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { FeedbackBanner, type FeedbackState } from '../ui/FeedbackBanner';
import { SlideView } from './SlideView';
import { CongratsScreen } from './CongratsScreen';

interface LessonPlayerProps {
  course: Course;
  lesson: Lesson;
  initialSlideIndex: number;
  initialCompletedSlideIds: string[];
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
}: LessonPlayerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const total = lesson.slides.length;
  const startIndex = Math.min(Math.max(0, initialSlideIndex), total - 1);

  const [slideIndex, setSlideIndex] = useState(startIndex);
  // Furthest slide the student has reached. Going backwards never lowers this,
  // so revisiting earlier slides won't rewind their saved progress.
  const [maxReached, setMaxReached] = useState(startIndex);
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
    setMaxReached((m) => Math.max(m, slideIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex]);

  // Debounced auto-save of position + completed slides. We persist the furthest
  // slide reached (not the current view), so going back to recap a lesson never
  // rewinds where the student resumes from.
  useEffect(() => {
    if (!user || finished) return;
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
  }, [user, course, lesson, maxReached, completed, finished]);

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
        if (user) void recordProblemSolved(user.uid);
      }
    }
  };

  const finishLesson = useCallback(async () => {
    markComplete(slide.id);
    if (user) {
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
  }, [user, course, lesson, slide.id, markComplete]);

  const handleAdvance = () => {
    markComplete(slide.id);
    if (slideIndex < total - 1) {
      setSlideIndex((i) => i + 1);
    } else {
      void finishLesson();
    }
  };

  const handleBack = () => {
    setSlideIndex((i) => Math.max(0, i - 1));
  };

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
        streakExtended={result.streakExtended}
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
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8">
        <SlideView
          key={slide.id}
          slide={slide}
          answer={answer}
          onAnswer={setAnswer}
          showMistakes={checked && !isCorrect}
        />
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
    </div>
  );
}
