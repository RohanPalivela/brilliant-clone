import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './components/layout/RequireAuth';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';

export default function App() {
  return (
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
  );
}
