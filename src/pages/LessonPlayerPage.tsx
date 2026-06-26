import { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
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

interface TutorJumpState {
  /** Slide index the tutor sent the learner to. */
  tutorInitialSlide?: number;
  /** Read-only review visit (don't write progress). */
  review?: boolean;
  /** A phrase to spotlight on the destination slide. */
  tutorHighlight?: string;
}

export function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const location = useLocation();
  const jump = (location.state as TutorJumpState | null) ?? null;
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

  // A tutor jump opens a specific slide without touching saved progress: the
  // viewed slide is the jump target, but the *furthest reached* stays at the
  // genuinely-saved position so progress can never be inflated by a review.
  const total = found.lesson.slides.length;
  const hasJump =
    typeof jump?.tutorInitialSlide === 'number' && jump.tutorInitialSlide >= 0;
  const jumpIndex = hasJump
    ? Math.min(jump!.tutorInitialSlide!, total - 1)
    : null;
  const initialSlideIndex = jumpIndex ?? resume.index;
  const reviewMode = hasJump && !!jump?.review;
  const initialHighlight = hasJump ? jump?.tutorHighlight : undefined;

  return (
    <LessonPlayer
      key={found.lesson.id}
      course={found.course}
      lesson={found.lesson}
      initialSlideIndex={initialSlideIndex}
      initialMaxReached={resume.index}
      initialCompletedSlideIds={resume.completed}
      reviewMode={reviewMode}
      initialHighlight={initialHighlight}
    />
  );
}
