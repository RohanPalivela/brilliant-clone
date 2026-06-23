import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getLesson } from '../content';
import { useAuth } from '../hooks/useAuth';
import { startLesson, getLessonProgress } from '../data/progressService';
import { LessonPlayer } from '../components/lesson/LessonPlayer';

export function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const found = courseId && lessonId ? getLesson(courseId, lessonId) : undefined;

  // Lesson content is bundled, so we can render the first slide immediately and
  // never block "first interaction" on the network. Resume position is resolved
  // in the background; if a saved spot exists we remount the player at it once
  // — but only while the learner hasn't already started moving.
  const [resume, setResume] = useState<{
    index: number;
    completed: string[];
    applied: boolean;
  }>({ index: 0, completed: [], applied: false });
  const interacted = useRef(false);

  useEffect(() => {
    if (!user || !courseId || !lessonId) return;
    const data = getLesson(courseId, lessonId);
    if (!data) return;

    let cancelled = false;
    // Fire-and-forget: make sure progress docs exist. This is a write that the
    // first render doesn't depend on, so it stays off the critical path.
    void startLesson(user.uid, data.course, data.lesson);

    (async () => {
      const lp = await getLessonProgress(user.uid, data.lesson.id);
      if (cancelled || interacted.current) return;
      // Replaying a completed lesson restarts from the top (nothing to resume).
      if (lp?.status === 'completed') return;
      const index = lp?.currentSlideIndex ?? 0;
      const completed = lp?.completedSlideIds ?? [];
      if (index === 0 && completed.length === 0) return;
      setResume({ index, completed, applied: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseId, lessonId]);

  if (!found) return <Navigate to="/courses" replace />;

  return (
    <LessonPlayer
      // Remount only when a real resume position arrives, so a returning
      // learner lands on their saved slide. Fresh lessons keep their first
      // (instant) mount.
      key={`${found.lesson.id}:${resume.applied ? resume.index : 'fresh'}`}
      course={found.course}
      lesson={found.lesson}
      initialSlideIndex={resume.index}
      initialCompletedSlideIds={resume.completed}
      onInteraction={() => {
        interacted.current = true;
      }}
    />
  );
}
