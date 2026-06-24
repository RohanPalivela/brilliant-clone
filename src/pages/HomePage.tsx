import { Link } from 'react-router-dom';
import { Flame, ArrowRight, PlayCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStreak } from '../hooks/useStreak';
import { useCourseProgress } from '../hooks/useProgress';
import { courses, getCourse, firstIncompleteLesson } from '../content';
import { resolveDisplayName } from '../lib/name';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CourseCard } from '../components/course/CourseCard';

const FEATURED_COURSE_ID = 'dynamic-programming-mastery';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomePage() {
  const { profile } = useAuth();
  const streak = useStreak();
  const course = getCourse(FEATURED_COURSE_ID)!;
  const { progress } = useCourseProgress(FEATURED_COURSE_ID);

  const completed = progress?.completedLessonIds ?? [];
  const started = !!progress;
  const percent = progress?.percentComplete ?? 0;
  const currentLesson =
    course.lessons.find((l) => l.id === progress?.currentLessonId) ??
    firstIncompleteLesson(course, completed);
  const currentNumber = course.lessons.findIndex((l) => l.id === currentLesson.id) + 1;
  const name = profile
    ? resolveDisplayName({
        displayName: profile.displayName,
        email: profile.email,
      }).split(' ')[0]
    : 'there';

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting + streak */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            {greeting()}, {name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Complete a lesson or 3 problems to keep your streak alive.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-center rounded-2xl bg-flame/10 px-4 py-3 text-flame">
          <Flame className="h-6 w-6" aria-hidden="true" />
          <span className="mt-1 text-xl font-extrabold leading-none">{streak}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide">
            day{streak === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Continue learning / empty state */}
      {started ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Continue learning
          </h2>
          <Card className="overflow-hidden p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  {course.title}
                </p>
                <h3 className="mt-1 truncate text-xl font-bold text-ink">
                  Lesson {currentNumber} · {currentLesson.title}
                </h3>
                <div className="mt-4 max-w-xs">
                  <div className="mb-1.5 text-xs font-medium text-ink-soft">
                    {percent}% of course complete
                  </div>
                  <ProgressBar value={percent} label="Course progress" />
                </div>
              </div>
              <Link
                to={`/courses/${course.id}/lessons/${currentLesson.id}`}
                className="shrink-0"
              >
                <Button size="lg" className="w-full sm:w-auto">
                  <PlayCircle className="h-5 w-5" aria-hidden="true" />
                  Continue
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      ) : (
        <Card className="flex flex-col items-start gap-4 bg-cta p-7 text-white">
          <div>
            <h2 className="text-xl font-bold">Start learning by doing</h2>
            <p className="mt-1 max-w-md text-sm text-white/70">
              Discover dynamic programming through interactive puzzles — no
              memoization syntax required.
            </p>
          </div>
          <Link to={`/courses/${course.id}/lessons/${course.lessons[0].id}`}>
            <Button variant="secondary" size="lg">
              Start {course.title}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Your courses */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Your courses
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              percentComplete={c.id === course.id ? percent : 0}
              started={c.id === course.id ? started : false}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
