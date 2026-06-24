import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeCourseProgress,
  subscribeAllCourseProgress,
} from '../data/progressService';
import type { CourseProgress } from '../types/progress';

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

/** Live map of every course the signed-in user has started, keyed by courseId. */
export function useAllCourseProgress() {
  const { user } = useAuth();
  const [byCourse, setByCourse] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setByCourse({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeAllCourseProgress(user.uid, (map) => {
      setByCourse(map);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { byCourse, loading };
}
