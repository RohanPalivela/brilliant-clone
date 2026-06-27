import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Flame, Trophy, ArrowRight, RotateCcw, CalendarClock } from 'lucide-react';
import type { Course, Lesson } from '../../types/content';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { useReviewItems } from '../../hooks/useReviewItems';
import { useAuth } from '../../hooks/useAuth';

interface CongratsScreenProps {
  course: Course;
  lesson: Lesson;
  problemsSolved: number;
  percentComplete: number;
  newStreak: number;
  nextLesson?: Lesson;
  onNextLesson: () => void;
  onBackToCourse: () => void;
}

export function CongratsScreen({
  course,
  lesson,
  problemsSolved,
  percentComplete,
  newStreak,
  nextLesson,
  onNextLesson,
  onBackToCourse,
}: CongratsScreenProps) {
  const { dueCount } = useReviewItems();
  const { profile } = useAuth();
  const reviewsToday = profile?.reviewsCompletedToday ?? 0;
  // Nudge learners who still have spaced-recall problems waiting today. Reviews
  // count toward the streak on their own, so this is the moment to catch them
  // before they close the app thinking a lesson alone was "enough" for the day.
  const showReviewReminder = dueCount > 0;

  useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) return;
    confetti({
      particleCount: 140,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#16a34a', '#f97316', '#0b1020'],
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-10 text-center">
      <div className="animate-pop-in w-full max-w-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-correct-soft text-correct">
          <Trophy className="h-8 w-8" aria-hidden="true" />
        </div>

        <h1 className="text-3xl font-bold text-ink">Lesson complete!</h1>
        <p className="mt-2 text-muted">{lesson.title}</p>

        {newStreak >= 1 && (
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-flame/10 px-4 py-2 font-bold text-flame">
            <Flame className="h-5 w-5" aria-hidden="true" />
            {newStreak} day streak!
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-line bg-surface p-5 text-left shadow-[var(--shadow-card)]">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-ink-soft">Course progress</span>
            <span className="font-bold text-ink">{percentComplete}%</span>
          </div>
          <ProgressBar value={percentComplete} label="Course progress" />
          <p className="mt-4 text-sm text-muted">
            {problemsSolved} problem{problemsSolved === 1 ? '' : 's'} solved in this
            lesson
          </p>
        </div>

        {showReviewReminder ? (
          <div className="mt-6 rounded-2xl border border-flame/30 bg-flame/5 p-5 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-flame/15 text-flame">
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-ink">
                  {dueCount} review problem{dueCount === 1 ? '' : 's'} still due today
                </h2>
                <p className="mt-0.5 text-sm text-muted">
                  {reviewsToday > 0
                    ? 'Finish your queue to lock in spaced recall before the day ends.'
                    : 'A quick spaced-recall set keeps these patterns from fading — and counts toward your streak on its own.'}
                </p>
              </div>
            </div>
            <Link to="/review/session" className="mt-4 block">
              <Button size="lg" className="w-full">
                Review now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        ) : (
          // No problems are due *right now*, but every solved problem was just
          // scheduled for spaced review (the first ones return tomorrow). Make
          // that lesson→review contract explicit so a finished lesson never
          // reads as "and that's the end of it."
          <div className="mt-6 rounded-2xl border border-line bg-surface p-5 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <CalendarClock className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-ink">
                  Scheduled for spaced review
                </h2>
                <p className="mt-0.5 text-sm text-muted">
                  The problems you solved are now scheduled to come back for
                  spaced review — the first ones return tomorrow. Reviewing them
                  is what makes this stick.
                </p>
                <Link
                  to="/review"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                >
                  Track pattern mastery
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {nextLesson ? (
            <Button
              size="lg"
              variant={showReviewReminder ? 'secondary' : 'primary'}
              onClick={onNextLesson}
              className="w-full"
            >
              Next lesson
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <p className="text-sm font-medium text-correct">
              You’ve finished {course.title}. Nice work!
            </p>
          )}
          <Button
            variant="secondary"
            size="lg"
            onClick={onBackToCourse}
            className="w-full"
          >
            Back to course
          </Button>
        </div>
      </div>
    </div>
  );
}
