import { NavLink } from 'react-router-dom';
import { Home, BookOpen, User, Flame } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { effectiveStreak } from '../../data/streak';
import { cn } from '../../lib/cn';
import { Logo } from './Logo';

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/courses', label: 'Courses', icon: BookOpen, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
];

export function TopNav() {
  const { profile } = useAuth();
  const streak = profile
    ? effectiveStreak(profile.streak, profile.lastActivityDate)
    : 0;

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <NavLink to="/" aria-label="DPrilliant home">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-brand-soft text-brand'
                      : 'text-ink-soft hover:bg-canvas',
                  )
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div
            className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-sm font-bold text-flame"
            title={`${streak} day streak`}
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            {streak}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium',
                  isActive ? 'text-brand' : 'text-muted',
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
