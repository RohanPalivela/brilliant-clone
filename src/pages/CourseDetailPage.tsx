import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  Play,
  Clock,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { getCourse, firstIncompleteLesson, isLessonUnlocked } from '../content';
import { useCourseProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';
import { resetCourseProgress } from '../data/progressService';
import type { Lesson } from '../types/content';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { cn } from '../lib/cn';

type NodeState = 'completed' | 'in_progress' | 'not_started' | 'locked';

export function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const course = courseId ? getCourse(courseId) : undefined;
  const { progress } = useCourseProgress(courseId ?? '');

  const [confirmRestart, setConfirmRestart] = useState(false);
  const [restarting, setRestarting] = useState(false);

  if (!course) return <Navigate to="/courses" replace />;

  const completedIds = progress?.completedLessonIds ?? [];
  const currentLessonId = progress?.currentLessonId;
  const percent = progress?.percentComplete ?? 0;
  const completedCount = completedIds.length;
  const canRestart = percent > 0;
  const minutesRemaining = course.lessons
    .filter((l) => !completedIds.includes(l.id))
    .reduce((sum, l) => sum + l.estimatedMinutes, 0);

  const nextLesson = firstIncompleteLesson(course, completedIds);

  const restartCourse = async () => {
    if (!user || !courseId) return;
    setRestarting(true);
    try {
      await resetCourseProgress(user.uid, courseId);
      setConfirmRestart(false);
    } finally {
      setRestarting(false);
    }
  };

  const stateOf = (lesson: Lesson): NodeState => {
    if (completedIds.includes(lesson.id)) return 'completed';
    if (!isLessonUnlocked(course, lesson.id, completedIds)) return 'locked';
    if (lesson.id === currentLessonId) return 'in_progress';
    return 'not_started';
  };

  const open = (lesson: Lesson) =>
    navigate(`/courses/${course.id}/lessons/${lesson.id}`);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header>
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="mb-4 text-sm font-medium text-muted hover:text-ink"
        >
          ← All courses
        </button>
        <Card className="p-6">
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold capitalize text-brand">
            {course.difficulty}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
            {course.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {course.description}
          </p>

          <div className="mt-5">
            <ProgressBar value={percent} label="Course progress" />
            <div className="mt-2 flex items-center gap-4 text-xs text-muted">
              <span>
                {completedCount} of {course.lessons.length} lessons completed
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />~
                {minutesRemaining} min remaining
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => open(nextLesson)}>
              {completedCount === 0
                ? 'Start course'
                : completedCount === course.lessons.length
                  ? 'Review course'
                  : 'Continue'}
            </Button>

            {canRestart &&
              (confirmRestart ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted">
                    Clear your progress and start over?
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmRestart(false)}
                    disabled={restarting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void restartCourse()}
                    disabled={restarting}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    {restarting ? 'Restarting…' : 'Confirm restart'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setConfirmRestart(true)}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Restart course
                </Button>
              ))}
          </div>
        </Card>
      </header>

      {/* Lesson path */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Lessons
        </h2>
        <ol className="flex flex-col gap-3">
          {course.lessons.map((lesson, i) => {
            const state = stateOf(lesson);
            const locked = state === 'locked';
            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => open(lesson)}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors',
                    locked
                      ? 'cursor-not-allowed border-line bg-canvas opacity-70'
                      : 'border-line bg-surface shadow-[var(--shadow-card)] hover:border-brand/40',
                  )}
                >
                  <StateBadge state={state} number={i + 1} />

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate font-semibold',
                        locked ? 'text-muted' : 'text-ink',
                      )}
                    >
                      {lesson.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {lesson.estimatedMinutes} min
                      {state === 'in_progress' && (
                        <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 font-semibold text-brand">
                          In progress
                        </span>
                      )}
                    </p>
                  </div>

                  {!locked &&
                    (state === 'completed' ? (
                      <RotateCcw
                        className="h-4 w-4 shrink-0 text-muted"
                        aria-label="Review lesson"
                      />
                    ) : (
                      <ChevronRight
                        className="h-5 w-5 shrink-0 text-muted"
                        aria-hidden="true"
                      />
                    ))}
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function StateBadge({ state, number }: { state: NodeState; number: number }) {
  if (state === 'completed')
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-correct-soft text-correct">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
      </span>
    );
  if (state === 'locked')
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-line text-muted">
        <Lock className="h-5 w-5" aria-hidden="true" />
      </span>
    );
  if (state === 'in_progress')
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
        <Play className="h-5 w-5" aria-hidden="true" />
      </span>
    );
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-line font-bold text-ink-soft">
      {number}
    </span>
  );
}
