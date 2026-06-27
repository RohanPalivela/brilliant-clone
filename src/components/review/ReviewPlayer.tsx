import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X, Lightbulb, ArrowRight, Check, RotateCcw } from 'lucide-react';
import type { SlideAnswer } from '../../types/content';
import type { Grade, ReviewItem } from '../../types/review';
import { defaultAnswer } from '../../lib/answers';
import { validateAnswer } from '../../lib/validation';
import { gradeOutcome, scheduleNext } from '../../lib/srs';
import { applyReviewResult } from '../../data/reviewService';
import { recordReviewCompleted } from '../../data/progressService';
import { getReviewSlide, getReviewableRef, getSkill } from '../../content/skills';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { FeedbackBanner, type FeedbackState } from '../ui/FeedbackBanner';
import { SlideView } from '../lesson/SlideView';

/** Outcome of one item within a review session, for the end-of-session summary. */
export interface ReviewResult {
  itemKey: string;
  skillId: string;
  grade: Grade;
  correct: boolean;
}

interface ReviewPlayerProps {
  /** Pre-interleaved queue of due items. */
  queue: ReviewItem[];
  onDone: (results: ReviewResult[]) => void;
  onExit: () => void;
}

const CORRECT_MESSAGE = 'Recalled it — nice.';

export function ReviewPlayer({ queue, onDone, onExit }: ReviewPlayerProps) {
  const { user } = useAuth();
  const reduce = useReducedMotion();

  // The live queue can grow: a forgotten item is requeued once for a second
  // in-session attempt (desirable difficulty without ending on a failure).
  const [items, setItems] = useState<ReviewItem[]>(queue);
  const [pos, setPos] = useState(0);
  const [dir, setDir] = useState(1);

  const [answer, setAnswer] = useState<SlideAnswer>({ kind: 'none' });
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const resultsRef = useRef<ReviewResult[]>([]);
  const requeued = useRef<Set<string>>(new Set());
  // When the current slide was first shown — used to measure recall latency so
  // a clean, fast recall can be graded `easy` (and to surface timing telemetry).
  const shownAtRef = useRef<number>(Date.now());

  const item = items[pos];
  const slide = item
    ? getReviewSlide(item.courseId, item.lessonId, item.slideId)
    : undefined;
  const ref = item ? getReviewableRef(item.itemKey) : undefined;
  const skill = item ? getSkill(item.skillId) : undefined;

  // Reset per-item state whenever we move to a new position in the queue.
  useEffect(() => {
    setAnswer(slide ? defaultAnswer(slide) : { kind: 'none' });
    setChecked(false);
    setIsCorrect(false);
    setHintOpen(false);
    setUsedHint(false);
    setWrongAttempts(0);
    shownAtRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  const advance = useCallback(
    (outcome: { correct: boolean; usedHint: boolean; wrongAttempts: number }) => {
      if (!item) return;
      // Attach recall latency so the scheduler can reward fast, clean recall.
      // `elapsedMs` is an optional field on ReviewOutcome; we build a plain
      // object (not a literal passed inline) so this compiles regardless of
      // whether the type already declares the field in the current merge state.
      const elapsedMs = Date.now() - shownAtRef.current;
      const fullOutcome = { ...outcome, elapsedMs };
      const grade = gradeOutcome(fullOutcome);
      if (user) {
        // Fire-and-forget: keep the transition snappy, but don't crash silently
        // if the write fails.
        applyReviewResult(user.uid, item, fullOutcome).catch(() => {});
        // Reviews are real retrieval practice — each one counts toward the
        // daily review goal and keeps the streak alive.
        if (outcome.correct) void recordReviewCompleted(user.uid);
      }

      resultsRef.current = [
        ...resultsRef.current,
        { itemKey: item.itemKey, skillId: item.skillId, grade, correct: outcome.correct },
      ];

      let queueLen = items.length;
      if (grade === 'again' && !requeued.current.has(item.itemKey)) {
        requeued.current.add(item.itemKey);
        // Requeue the POST-attempt state, not the stale pre-failure item. The
        // second in-session attempt must grade from the post-lapse baseline
        // (reps reset, interval short → growing) so a forgotten item resurfaces
        // tomorrow instead of being pushed weeks out. scheduleNext is pure, so
        // we derive the requeue copy locally without blocking the transition;
        // the eventual Firestore write for the second attempt builds on this.
        const next = scheduleNext(item, grade);
        const requeuedItem: ReviewItem = {
          ...item,
          ...next,
          lastResult: grade,
          attempts: item.attempts + 1,
          correctCount: item.correctCount + (outcome.correct ? 1 : 0),
        };
        setItems((q) => [...q, requeuedItem]);
        queueLen += 1;
      }

      if (pos + 1 >= queueLen) {
        onDone(resultsRef.current);
      } else {
        setDir(1);
        setPos((p) => p + 1);
      }
    },
    [item, items.length, pos, user, onDone],
  );

  // If a queued item can't resolve to live content (e.g. content changed under
  // a stale queue), end the session cleanly rather than rendering nothing.
  useEffect(() => {
    if (!item || !slide) onDone(resultsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, slide]);

  const handleCheck = () => {
    if (!slide) return;
    const correct = validateAnswer(slide.validation, answer);
    setChecked(true);
    setHintOpen(false);
    if (correct) setIsCorrect(true);
    else setWrongAttempts((n) => n + 1);
  };

  const onAnswer = useCallback((a: SlideAnswer) => {
    setAnswer(a);
    setChecked(false);
    setIsCorrect(false);
  }, []);

  const feedback: { state: FeedbackState; message: string } = useMemo(() => {
    if (hintOpen && slide?.hint) return { state: 'hint', message: slide.hint };
    if (checked && isCorrect) return { state: 'correct', message: CORRECT_MESSAGE };
    if (checked && !isCorrect)
      return {
        state: 'wrong',
        message:
          slide?.explanationOnWrong ??
          'Not quite — recall the rule and try once more.',
      };
    return { state: null, message: '' };
  }, [hintOpen, checked, isCorrect, slide]);

  if (!item || !slide) return null;

  const total = items.length;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <button
            type="button"
            aria-label="End review"
            onClick={onExit}
            className="rounded-full p-1.5 text-muted hover:bg-canvas hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <RotateCcw className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            {/* Keep the pattern identity hidden during the attempt — naming the
                skill up front spoils the interleaving (the learner should first
                ask "which pattern is this?"). Reveal it once they've checked. */}
            <span className="truncate text-sm font-semibold text-ink">
              {checked ? skill?.name ?? 'Review' : 'Spaced recall'}
            </span>
          </div>
          <span className="text-xs font-medium tabular-nums text-muted">
            {pos + 1} / {total}
          </span>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-3">
          <ProgressBar
            value={pos + 1}
            max={total}
            segments={Math.min(total, 16)}
            label="Review session progress"
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center overflow-hidden px-4 py-8">
        {ref && checked && (
          <p className="mx-auto mb-4 text-center text-xs font-medium uppercase tracking-wide text-muted">
            Recall from · {ref.lessonTitle}
          </p>
        )}
        <motion.div
          key={`${item.itemKey}-${pos}`}
          initial={reduce ? false : { x: dir * 48, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: 'easeOut' }}
        >
          <SlideView
            slide={slide}
            answer={answer}
            onAnswer={onAnswer}
            showMistakes={checked && !isCorrect}
          />
        </motion.div>
      </main>

      <footer className="sticky bottom-0 border-t border-line bg-surface">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {feedback.state && (
            <div className="mb-3">
              <FeedbackBanner state={feedback.state} message={feedback.message} />
            </div>
          )}
          <div className="flex items-center gap-3">
            {slide.hint && !isCorrect && (
              <Button
                variant="ghost"
                onClick={() => {
                  setHintOpen((v) => !v);
                  setUsedHint(true);
                }}
                aria-pressed={hintOpen}
              >
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                Hint
              </Button>
            )}
            {!isCorrect && wrongAttempts > 0 && (
              <Button
                variant="ghost"
                onClick={() => advance({ correct: false, usedHint, wrongAttempts })}
              >
                I'll try again tomorrow
              </Button>
            )}
            <div className="flex-1" />
            {isCorrect ? (
              <Button
                size="lg"
                onClick={() => advance({ correct: true, usedHint, wrongAttempts })}
              >
                {pos + 1 < total ? 'Next' : 'Finish review'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button size="lg" onClick={handleCheck}>
                <Check className="h-4 w-4" aria-hidden="true" />
                Check
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
