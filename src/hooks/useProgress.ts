import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeCourseProgress,
  getAllLessonProgress,
} from '../data/progressService';
import type { CourseProgress, LessonProgress } from '../types/progress';

/** Live course-level progress for the signed-in user. */
export function useCourseProgress(courseId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeCourseProgress(user.uid, courseId, (p) => {
      setProgress(p);
      setLoading(false);
    });
    return unsub;
  }, [user, courseId]);

  return { progress, loading };
}

/** One-shot fetch of all lesson progress (used by the course detail path).
 *  `refreshKey` lets callers re-fetch after returning from a lesson. */
export function useAllLessonProgress(refreshKey: unknown = 0) {
  const { user } = useAuth();
  const [byLesson, setByLesson] = useState<Record<string, LessonProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setByLesson({});
      setLoading(false);
      return;
    }
    setLoading(true);
    getAllLessonProgress(user.uid).then((map) => {
      if (!cancelled) {
        setByLesson(map);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  return { byLesson, loading };
}
