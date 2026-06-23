import { useCourseProgress } from '../hooks/useProgress';
import { courses } from '../content';
import { CourseCard } from '../components/course/CourseCard';

const FEATURED_COURSE_ID = 'dynamic-programming';

export function CoursesPage() {
  const { progress } = useCourseProgress(FEATURED_COURSE_ID);
  const percentById: Record<string, number> = {
    [FEATURED_COURSE_ID]: progress?.percentComplete ?? 0,
  };
  const startedById: Record<string, boolean> = {
    [FEATURED_COURSE_ID]: !!progress,
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Courses</h1>
        <p className="mt-1 text-sm text-muted">
          Interactive lessons in math and computer science.
        </p>
      </div>

      {/* Learning Path strip (visual only in v1) */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Programming &amp; CS
          </h2>
          <p className="text-xs text-muted">
            Build computational thinking from first principles.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              percentComplete={percentById[course.id] ?? 0}
              started={startedById[course.id] ?? false}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
