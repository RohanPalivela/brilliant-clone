// User + progress documents persisted in Firestore. Matches PRD Section 11.1.

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: number;
  streak: number;
  /** YYYY-MM-DD of the last day a qualifying activity extended the streak. */
  lastActivityDate: string;
  streakCharges: number;
  /** The day (YYYY-MM-DD) the *Today counters below apply to. */
  todayKey: string;
  problemsSolvedToday: number;
  lessonsCompletedToday: number;
  totalLessonsCompleted: number;
}

export interface CourseProgress {
  courseId: string;
  startedAt: number;
  updatedAt: number;
  percentComplete: number;
  currentLessonId: string;
  currentSlideIndex: number;
  completedLessonIds: string[];
}

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  startedAt: number;
  completedAt: number | null;
  currentSlideIndex: number;
  completedSlideIds: string[];
  status: LessonStatus;
}
