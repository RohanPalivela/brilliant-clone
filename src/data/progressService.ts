import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import type {
  CourseProgress,
  LessonProgress,
  UserProfile,
} from '../types/progress';
import type { Course, Lesson } from '../types/content';
import { applyActivity, dateKey } from './streak';
import { resolveDisplayName } from '../lib/name';

const userRef = (uid: string) => doc(db, 'users', uid);
const courseProgressRef = (uid: string, courseId: string) =>
  doc(db, 'users', uid, 'courseProgress', courseId);
const lessonProgressRef = (uid: string, lessonId: string) =>
  doc(db, 'users', uid, 'lessonProgress', lessonId);

// ---------------------------------------------------------------------------
// User profile
// ---------------------------------------------------------------------------

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  const profile: UserProfile = {
    uid: user.uid,
    displayName:
      user.displayName ?? resolveDisplayName({ email: user.email }),
    email: user.email ?? '',
    createdAt: Date.now(),
    streak: 0,
    lastActivityDate: '',
    streakCharges: 0,
    todayKey: dateKey(),
    problemsSolvedToday: 0,
    lessonsCompletedToday: 0,
    totalLessonsCompleted: 0,
  };
  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export function subscribeUserProfile(
  uid: string,
  cb: (profile: UserProfile | null) => void,
): () => void {
  return onSnapshot(userRef(uid), (snap) =>
    cb(snap.exists() ? (snap.data() as UserProfile) : null),
  );
}

export async function updateDisplayName(
  uid: string,
  displayName: string,
): Promise<void> {
  await updateDoc(userRef(uid), { displayName });
}

/**
 * Wipe every learning document for a user: their profile, all course progress,
 * and all lesson progress. Used before deleting the Auth account so we never
 * leave orphaned data behind. Firestore has no recursive delete on the client,
 * so we enumerate the subcollections and batch the deletes.
 */
export async function deleteUserData(uid: string): Promise<void> {
  const [courseSnaps, lessonSnaps] = await Promise.all([
    getDocs(collection(db, 'users', uid, 'courseProgress')),
    getDocs(collection(db, 'users', uid, 'lessonProgress')),
  ]);

  const batch = writeBatch(db);
  courseSnaps.forEach((s) => batch.delete(s.ref));
  lessonSnaps.forEach((s) => batch.delete(s.ref));
  batch.delete(userRef(uid));
  await batch.commit();
}

/**
 * Reset a single course back to its untouched state so the learner can take it
 * again: drop the course-progress doc and every lesson-progress doc that
 * belongs to it. The user's lifetime lesson total is rolled back by the number
 * of lessons that were completed in this course, keeping profile stats honest.
 */
export async function resetCourseProgress(
  uid: string,
  courseId: string,
): Promise<void> {
  const [cp, lessonSnaps, profile] = await Promise.all([
    getCourseProgress(uid, courseId),
    getDocs(collection(db, 'users', uid, 'lessonProgress')),
    getUserProfile(uid),
  ]);

  const batch = writeBatch(db);
  lessonSnaps.forEach((s) => {
    if ((s.data() as LessonProgress).courseId === courseId) batch.delete(s.ref);
  });
  batch.delete(courseProgressRef(uid, courseId));

  const completedInCourse = cp?.completedLessonIds.length ?? 0;
  if (profile && completedInCourse > 0) {
    batch.update(userRef(uid), {
      totalLessonsCompleted: Math.max(
        0,
        profile.totalLessonsCompleted - completedInCourse,
      ),
    });
  }

  await batch.commit();
}

// ---------------------------------------------------------------------------
// Course progress
// ---------------------------------------------------------------------------

export async function getCourseProgress(
  uid: string,
  courseId: string,
): Promise<CourseProgress | null> {
  const snap = await getDoc(courseProgressRef(uid, courseId));
  return snap.exists() ? (snap.data() as CourseProgress) : null;
}

export function subscribeCourseProgress(
  uid: string,
  courseId: string,
  cb: (progress: CourseProgress | null) => void,
): () => void {
  return onSnapshot(courseProgressRef(uid, courseId), (snap) =>
    cb(snap.exists() ? (snap.data() as CourseProgress) : null),
  );
}

export async function getAllLessonProgress(
  uid: string,
): Promise<Record<string, LessonProgress>> {
  const snaps = await getDocs(collection(db, 'users', uid, 'lessonProgress'));
  const out: Record<string, LessonProgress> = {};
  snaps.forEach((s) => {
    const lp = s.data() as LessonProgress;
    out[lp.lessonId] = lp;
  });
  return out;
}

export async function getLessonProgress(
  uid: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  const snap = await getDoc(lessonProgressRef(uid, lessonId));
  return snap.exists() ? (snap.data() as LessonProgress) : null;
}

// ---------------------------------------------------------------------------
// Mutations driven by the lesson player
// ---------------------------------------------------------------------------

function percentFor(course: Course, completedLessonIds: string[]): number {
  if (course.lessonOrder.length === 0) return 0;
  const completed = course.lessonOrder.filter((id) =>
    completedLessonIds.includes(id),
  ).length;
  return Math.round((completed / course.lessonOrder.length) * 100);
}

/** Called when a learner opens a lesson; creates progress docs if missing. */
export async function startLesson(
  uid: string,
  course: Course,
  lesson: Lesson,
): Promise<void> {
  const lpRef = lessonProgressRef(uid, lesson.id);
  const lpSnap = await getDoc(lpRef);
  if (!lpSnap.exists()) {
    const lp: LessonProgress = {
      lessonId: lesson.id,
      courseId: course.id,
      startedAt: Date.now(),
      completedAt: null,
      currentSlideIndex: 0,
      completedSlideIds: [],
      status: 'in_progress',
    };
    await setDoc(lpRef, lp);
  } else if ((lpSnap.data() as LessonProgress).status === 'not_started') {
    await updateDoc(lpRef, { status: 'in_progress' });
  }

  const cpRef = courseProgressRef(uid, course.id);
  const cpSnap = await getDoc(cpRef);
  if (!cpSnap.exists()) {
    const cp: CourseProgress = {
      courseId: course.id,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      percentComplete: 0,
      currentLessonId: lesson.id,
      currentSlideIndex: 0,
      completedLessonIds: [],
    };
    await setDoc(cpRef, cp);
  } else {
    await updateDoc(cpRef, {
      currentLessonId: lesson.id,
      updatedAt: Date.now(),
    });
  }
}

/** Debounced auto-save target: persist slide position. */
export async function saveSlideProgress(
  uid: string,
  course: Course,
  lesson: Lesson,
  slideIndex: number,
  completedSlideIds: string[],
): Promise<void> {
  await Promise.all([
    setDoc(
      lessonProgressRef(uid, lesson.id),
      {
        lessonId: lesson.id,
        courseId: course.id,
        currentSlideIndex: slideIndex,
        completedSlideIds,
        status: 'in_progress',
      },
      { merge: true },
    ),
    setDoc(
      courseProgressRef(uid, course.id),
      {
        courseId: course.id,
        currentLessonId: lesson.id,
        currentSlideIndex: slideIndex,
        updatedAt: Date.now(),
      },
      { merge: true },
    ),
  ]);
}

/** Record a correctly-solved interactive problem (drives streak via 3/day). */
export async function recordProblemSolved(uid: string): Promise<void> {
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const next = applyActivity(profile, { problemsSolved: 1 });
  await updateDoc(userRef(uid), {
    streak: next.streak,
    lastActivityDate: next.lastActivityDate,
    todayKey: next.todayKey,
    problemsSolvedToday: next.problemsSolvedToday,
    lessonsCompletedToday: next.lessonsCompletedToday,
  });
}

export interface LessonCompletionResult {
  streakExtended: boolean;
  newStreak: number;
  percentComplete: number;
  alreadyCompleted: boolean;
}

/** Mark a lesson complete; update course %, totals, and streak. */
export async function completeLesson(
  uid: string,
  course: Course,
  lesson: Lesson,
): Promise<LessonCompletionResult> {
  const [profile, cp] = await Promise.all([
    getUserProfile(uid),
    getCourseProgress(uid, course.id),
  ]);

  const prevCompleted = cp?.completedLessonIds ?? [];
  const alreadyCompleted = prevCompleted.includes(lesson.id);
  const completedLessonIds = alreadyCompleted
    ? prevCompleted
    : [...prevCompleted, lesson.id];
  const percentComplete = percentFor(course, completedLessonIds);

  await setDoc(
    lessonProgressRef(uid, lesson.id),
    {
      lessonId: lesson.id,
      courseId: course.id,
      status: 'completed',
      completedAt: Date.now(),
      currentSlideIndex: lesson.slides.length - 1,
    },
    { merge: true },
  );

  await setDoc(
    courseProgressRef(uid, course.id),
    {
      courseId: course.id,
      completedLessonIds,
      percentComplete,
      currentLessonId: lesson.id,
      updatedAt: Date.now(),
    },
    { merge: true },
  );

  let streakExtended = false;
  let newStreak = profile?.streak ?? 0;

  if (profile && !alreadyCompleted) {
    const next = applyActivity(profile, { lessonsCompleted: 1 });
    streakExtended = next.streakExtended;
    newStreak = next.streak;
    await updateDoc(userRef(uid), {
      streak: next.streak,
      lastActivityDate: next.lastActivityDate,
      todayKey: next.todayKey,
      problemsSolvedToday: next.problemsSolvedToday,
      lessonsCompletedToday: next.lessonsCompletedToday,
      totalLessonsCompleted: profile.totalLessonsCompleted + 1,
    });
  }

  return { streakExtended, newStreak, percentComplete, alreadyCompleted };
}
