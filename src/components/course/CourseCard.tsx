import { Link } from 'react-router-dom';
import { Clock, Layers, ArrowRight } from 'lucide-react';
import type { Course } from '../../types/content';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

interface CourseCardProps {
  course: Course;
  percentComplete: number;
  started: boolean;
}

export function CourseCard({ course, percentComplete, started }: CourseCardProps) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block focus-visible:outline-none"
    >
      <Card className="flex h-full flex-col p-5 transition-shadow group-hover:shadow-[0_4px_12px_rgba(16,24,40,0.1),0_16px_40px_-16px_rgba(16,24,40,0.28)] group-focus-visible:ring-2 group-focus-visible:ring-brand">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold capitalize text-brand">
            {course.difficulty}
          </span>
        </div>

        <h3 className="text-lg font-bold text-ink">{course.title}</h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">
          {course.shortDescription}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />~
            {course.estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            {course.lessons.length} lessons
          </span>
        </div>

        {started && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs font-medium text-ink-soft">
              <span>{percentComplete}% complete</span>
            </div>
            <ProgressBar value={percentComplete} label={`${course.title} progress`} />
          </div>
        )}

        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand">
          {started ? 'Continue' : 'Start course'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Card>
    </Link>
  );
}
