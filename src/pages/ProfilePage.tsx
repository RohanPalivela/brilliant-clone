import { useState } from 'react';
import {
  Flame,
  BookCheck,
  GraduationCap,
  LogOut,
  Pencil,
  Check,
  Sun,
  Moon,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStreak } from '../hooks/useStreak';
import { useCourseProgress } from '../hooks/useProgress';
import { useTheme } from '../hooks/useTheme';
import { updateDisplayName } from '../data/progressService';
import { resolveDisplayName } from '../lib/name';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';
import type { Theme } from '../lib/theme';

const TRACKED_COURSE_ID = 'dynamic-programming-mastery';

export function ProfilePage() {
  const { user, profile, logout, deleteAccount } = useAuth();
  const streak = useStreak();
  const { progress } = useCourseProgress(TRACKED_COURSE_ID);
  const { theme, setTheme } = useTheme();

  const personName = resolveDisplayName({
    displayName: profile?.displayName,
    email: profile?.email,
  });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(personName);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const coursesInProgress =
    progress && progress.percentComplete > 0 && progress.percentComplete < 100
      ? 1
      : 0;

  const saveName = async () => {
    if (user && name.trim()) await updateDisplayName(user.uid, name.trim());
    setEditing(false);
  };

  const deleteProfile = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      // On success the auth listener clears the session and the protected
      // route redirects to /auth, so there's nothing to do here afterwards.
      await deleteAccount();
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: unknown }).code)
          : '';
      setDeleteError(
        code === 'auth/requires-recent-login'
          ? 'For your security, please sign out and sign back in, then try deleting again.'
          : 'Something went wrong deleting your account. Please try again.',
      );
      setDeleting(false);
    }
  };

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  const stats = [
    { label: 'Day streak', value: streak, icon: Flame, tint: 'text-flame' },
    {
      label: 'Lessons completed',
      value: profile?.totalLessonsCompleted ?? 0,
      icon: BookCheck,
      tint: 'text-correct',
    },
    {
      label: 'Courses in progress',
      value: coursesInProgress,
      icon: GraduationCap,
      tint: 'text-brand',
    },
  ];

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Profile</h1>

      {/* Account */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Account
        </h2>
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={personName}
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
              {personName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  className="h-10 w-full max-w-xs rounded-lg border border-line px-3 text-sm outline-none focus:border-brand"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label="Display name"
                />
                <Button onClick={saveName} aria-label="Save name">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="truncate text-lg font-bold text-ink">
                  {personName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setName(personName);
                    setEditing(true);
                  }}
                  aria-label="Edit display name"
                  className="text-muted hover:text-ink"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
            <p className="truncate text-sm text-muted">{profile?.email}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => void logout()}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </Button>
      </Card>

      {/* Learning stats */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Learning stats
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, tint }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-xl bg-canvas p-4 text-center"
            >
              <Icon className={cn('h-6 w-6', tint)} aria-hidden="true" />
              <span className="mt-2 text-2xl font-extrabold text-ink">
                {value}
              </span>
              <span className="mt-0.5 text-xs text-muted">{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Appearance
        </h2>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Theme</p>
            <p className="text-sm text-muted">
              Choose how DPrilliant looks on this device.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Theme"
            className="flex shrink-0 rounded-full bg-canvas p-1"
          >
            {themeOptions.map(({ value, label, icon: Icon }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-surface text-ink shadow-[var(--shadow-card)]'
                      : 'text-muted hover:text-ink',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-wrong/30 p-6">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-wrong">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Danger zone
        </h2>
        <p className="mb-4 text-sm text-muted">
          Deleting your profile permanently removes your account and all of your
          learning progress. This cannot be undone.
        </p>
        {deleteError && (
          <p className="mb-4 text-sm font-medium text-wrong" role="alert">
            {deleteError}
          </p>
        )}
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmDelete(false);
                setDeleteError(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-wrong text-white hover:bg-wrong/90"
              onClick={() => void deleteProfile()}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {deleting ? 'Deleting…' : 'Yes, delete my profile'}
            </Button>
          </div>
        ) : (
          <Button
            className="bg-wrong text-white hover:bg-wrong/90"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete profile
          </Button>
        )}
      </Card>
    </div>
  );
}
