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
    lessonId: string;
    index: number;
    completed: string[];
    applied: boolean;
  }>({ lessonId: '', index: 0, completed: [], applied: false });
  const interacted = useRef(false);

  useEffect(() => {
    if (!user || !courseId || !lessonId) return;
    const data = getLesson(courseId, lessonId);
    if (!data) return;

    // We're entering a (possibly new) lesson. This page component is reused
    // across lessons — navigating L1 -> L2 only swaps the route param — so clear
    // the "already moving" guard. Otherwise a finished lesson's interaction flag
    // would suppress resuming the next lesson at its real saved position.
    interacted.current = false;

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
      setResume({ lessonId: data.lesson.id, index, completed, applied: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseId, lessonId]);

  if (!found) return <Navigate to="/courses" replace />;

  // Only honor a resolved resume position that belongs to the lesson on screen.
  // Resume state is keyed by lessonId so a previous lesson's saved slide can't
  // leak into the next one when this page is reused across lessons.
  const active =
    resume.applied && resume.lessonId === found.lesson.id ? resume : null;

  return (
    <LessonPlayer
      // Remount only when a real resume position arrives, so a returning
      // learner lands on their saved slide. Fresh lessons keep their first
      // (instant) mount.
      key={`${found.lesson.id}:${active ? active.index : 'fresh'}`}
      course={found.course}
      lesson={found.lesson}
      initialSlideIndex={active ? active.index : 0}
      initialCompletedSlideIds={active ? active.completed : []}
      onInteraction={() => {
        interacted.current = true;
      }}
    />
  );
}
