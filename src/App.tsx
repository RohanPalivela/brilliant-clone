import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './components/layout/RequireAuth';
import { AppShell } from './components/layout/AppShell';

const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })),
);
const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
);
const CoursesPage = lazy(() =>
  import('./pages/CoursesPage').then((m) => ({ default: m.CoursesPage })),
);
const CourseDetailPage = lazy(() =>
  import('./pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })),
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const LessonPlayerPage = lazy(() =>
  import('./pages/LessonPlayerPage').then((m) => ({ default: m.LessonPlayerPage })),
);

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-slate-400">
          Loading…
        </div>
      }
    >
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<RequireAuth />}>
          {/* Pages with the standard nav chrome */}
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Lesson player uses minimal chrome (no nav) */}
          <Route
            path="/courses/:courseId/lessons/:lessonId"
            element={<LessonPlayerPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
