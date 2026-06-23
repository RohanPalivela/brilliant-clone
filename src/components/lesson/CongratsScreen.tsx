import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Trophy, ArrowRight } from 'lucide-react';
import type { Course, Lesson } from '../../types/content';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

interface CongratsScreenProps {
  course: Course;
  lesson: Lesson;
  problemsSolved: number;
  percentComplete: number;
  streakExtended: boolean;
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
  streakExtended,
  newStreak,
  nextLesson,
  onNextLesson,
  onBackToCourse,
}: CongratsScreenProps) {
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

        {streakExtended && (
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

        <div className="mt-8 flex flex-col gap-3">
          {nextLesson ? (
            <Button size="lg" onClick={onNextLesson} className="w-full">
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
