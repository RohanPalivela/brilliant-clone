import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getLesson } from '../content';
import { useAuth } from '../hooks/useAuth';
import { startLesson, getLessonProgress } from '../data/progressService';
import { LessonPlayer } from '../components/lesson/LessonPlayer';
import { LoadingScreen } from '../components/ui/LoadingScreen';

interface Resume {
  lessonId: string;
  index: number;
  completed: string[];
}

export function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const found = courseId && lessonId ? getLesson(courseId, lessonId) : undefined;

  // Resolve the saved position *before* mounting the player so a returning
  // learner opens directly on their slide — no flash of slide 1, and no race
  // where an early interaction suppresses the resume jump. `resume` is null
  // while we're still loading for the current lesson.
  const [resume, setResume] = useState<Resume | null>(null);

  useEffect(() => {
    if (!user || !courseId || !lessonId) return;
    const data = getLesson(courseId, lessonId);
    if (!data) return;

    let cancelled = false;
    setResume(null);

    // Make sure progress docs exist, then read back where the learner was.
    void startLesson(user.uid, data.course, data.lesson);

    (async () => {
      let index = 0;
      let completed: string[] = [];
      try {
        const lp = await getLessonProgress(user.uid, data.lesson.id);
        // Replaying a completed lesson starts fresh; an in-progress one resumes.
        if (lp && lp.status !== 'completed') {
          index = lp.currentSlideIndex ?? 0;
          completed = lp.completedSlideIds ?? [];
        }
      } catch {
        // On a read failure, fall back to starting at the beginning.
      }
      if (cancelled) return;
      setResume({ lessonId: data.lesson.id, index, completed });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseId, lessonId]);

  if (!found) return <Navigate to="/courses" replace />;

  // Wait for the resume position that belongs to the lesson on screen. Resume is
  // keyed by lessonId so a previous lesson's saved slide can't leak into the
  // next one when this page is reused across lessons.
  if (!resume || resume.lessonId !== found.lesson.id) {
    return <LoadingScreen label="Loading lesson…" />;
  }

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
