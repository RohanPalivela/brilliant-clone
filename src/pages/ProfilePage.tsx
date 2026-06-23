import { useState } from 'react';
import { Flame, BookCheck, GraduationCap, LogOut, Pencil, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStreak } from '../hooks/useStreak';
import { useCourseProgress } from '../hooks/useProgress';
import { updateDisplayName } from '../data/progressService';
import { resolveDisplayName } from '../lib/name';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';

export function ProfilePage() {
  const { user, profile, logout } = useAuth();
  const streak = useStreak();
  const { progress } = useCourseProgress('dynamic-programming');

  const personName = resolveDisplayName({
    displayName: profile?.displayName,
    email: profile?.email,
  });

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(personName);

  const coursesInProgress =
    progress && progress.percentComplete > 0 && progress.percentComplete < 100
      ? 1
      : 0;

  const saveName = async () => {
    if (user && name.trim()) await updateDisplayName(user.uid, name.trim());
    setEditing(false);
  };

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
    </div>
  );
}
