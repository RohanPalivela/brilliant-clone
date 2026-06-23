import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getLesson } from '../content';
import { useAuth } from '../hooks/useAuth';
import { startLesson, getLessonProgress } from '../data/progressService';
import { LessonPlayer } from '../components/lesson/LessonPlayer';
import { LoadingScreen } from '../components/ui/LoadingScreen';

export function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const found = courseId && lessonId ? getLesson(courseId, lessonId) : undefined;

  const [resume, setResume] = useState<{
    loading: boolean;
    index: number;
    completed: string[];
  }>({ loading: true, index: 0, completed: [] });

  useEffect(() => {
    if (!user || !courseId || !lessonId) return;
    const data = getLesson(courseId, lessonId);
    if (!data) return;

    let cancelled = false;
    (async () => {
      await startLesson(user.uid, data.course, data.lesson);
      const lp = await getLessonProgress(user.uid, data.lesson.id);
      if (cancelled) return;
      // Replaying a completed lesson restarts from the top.
      const completedLesson = lp?.status === 'completed';
      setResume({
        loading: false,
        index: completedLesson ? 0 : (lp?.currentSlideIndex ?? 0),
        completed: completedLesson ? [] : (lp?.completedSlideIds ?? []),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseId, lessonId]);

  if (!found) return <Navigate to="/courses" replace />;
  if (resume.loading) return <LoadingScreen label="Loading lesson…" />;

  return (
    <LessonPlayer
      key={found.lesson.id}
      course={found.course}
      lesson={found.lesson}
      initialSlideIndex={resume.index}
      initialCompletedSlideIds={resume.completed}
    />
  );
}
