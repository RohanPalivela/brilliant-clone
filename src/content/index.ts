import type { Course, Lesson } from '../types/content';
import { dynamicProgrammingMastery } from './dynamic-programming-mastery';

export const courses: Course[] = [dynamicProgrammingMastery];

export function getCourse(courseId: string): Course | undefined {
  return courses.find((c) => c.id === courseId);
}

export function getLesson(
  courseId: string,
  lessonId: string,
): { course: Course; lesson: Lesson } | undefined {
  const course = getCourse(courseId);
  if (!course) return undefined;
  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  return { course, lesson };
}

export function getLessonByIndex(
  courseId: string,
  index: number,
): Lesson | undefined {
  return getCourse(courseId)?.lessons[index];
}

/** First lesson the learner has not completed yet (for Continue / Start). */
export function firstIncompleteLesson(
  course: Course,
  completedLessonIds: string[],
): Lesson {
  return (
    course.lessons.find((l) => !completedLessonIds.includes(l.id)) ??
    course.lessons[course.lessons.length - 1]
  );
}

/** Sequential unlock: a lesson is unlocked if it's the first or the previous
 *  one is completed. */
export function isLessonUnlocked(
  course: Course,
  lessonId: string,
  completedLessonIds: string[],
): boolean {
  const index = course.lessons.findIndex((l) => l.id === lessonId);
  if (index <= 0) return true;
  const prev = course.lessons[index - 1];
  return completedLessonIds.includes(prev.id);
}
