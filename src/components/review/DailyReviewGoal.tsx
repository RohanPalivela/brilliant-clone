import { Link } from 'react-router-dom';
import {
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  CalendarClock,
  Sparkles,
} from 'lucide-react';
import { formatDueDistance } from '../../lib/srs';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type ReviewGoalStatus = 'pending' | 'complete' | 'idle';

function reviewGoalStatus(
  dueCount: number,
  reviewsToday: number,
): ReviewGoalStatus {
  if (dueCount > 0) return 'pending';
  if (reviewsToday > 0) return 'complete';
  return 'idle';
}

interface DailyReviewGoalProps {
  dueCount: number;
  reviewsToday: number;
  hasItems: boolean;
  nextDueAt: number | null;
  /** Compact card for the home screen (hidden entirely when idle). */
  compact?: boolean;
}

/**
 * The daily review goal — the explicit "do this today" that makes spaced
 * repetition a habit rather than an optional tab. Clearing your due queue
 * completes the goal and, on its own, keeps your streak alive.
 */
export function DailyReviewGoal({
  dueCount,
  reviewsToday,
  hasItems,
  nextDueAt,
  compact,
}: DailyReviewGoalProps) {
  const status = reviewGoalStatus(dueCount, reviewsToday);

  if (compact && status === 'idle') return null;

  if (status === 'pending') {
    return (
      <Card
        className={
          compact
            ? 'flex items-center justify-between gap-4 p-5 transition-colors hover:bg-canvas'
            : 'overflow-hidden bg-cta p-6 text-white'
        }
      >
        {compact ? (
          <Link
            to="/review/session"
            className="flex w-full items-center justify-between gap-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-flame/10 text-flame">
                <RotateCcw className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-ink">
                  Today’s review goal · {dueCount} due
                </h3>
                <p className="truncate text-sm text-muted">
                  Clear them to keep your streak — reviews count on their own.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
          </Link>
        ) : (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Today’s review goal
              </div>
              <h2 className="mt-2 text-2xl font-bold">
                {dueCount} problem{dueCount === 1 ? '' : 's'} due
              </h2>
              <p className="mt-1 max-w-md text-sm text-white/70">
                A short, interleaved set mixing different DP patterns. Recall each
                one — no peeking at the lesson first. Clearing your queue keeps
                your streak alive.
              </p>
            </div>
            <Link to="/review/session" className="shrink-0">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Start review
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        )}
      </Card>
    );
  }

  if (status === 'complete') {
    return (
      <Card
        className={
          compact
            ? 'flex items-center gap-3 p-5'
            : 'flex flex-col items-start gap-4 p-6'
        }
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-correct-soft text-correct">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className={compact ? 'text-base font-bold text-ink' : 'text-lg font-bold text-ink'}>
              Review goal complete
            </h2>
            <p className="text-sm text-muted">
              {reviewsToday} review{reviewsToday === 1 ? '' : 's'} done today — streak secured.
              {nextDueAt ? ` Next batch ${formatDueDistance(nextDueAt)}.` : ''}
            </p>
          </div>
        </div>
        {!compact && hasItems && (
          <Link to="/review/session?mode=ahead">
            <Button variant="secondary" size="lg">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Practice ahead
            </Button>
          </Link>
        )}
      </Card>
    );
  }

  // idle (only rendered in full mode)
  return (
    <Card className="flex flex-col items-start gap-4 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas text-muted">
          <CalendarClock className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-ink">
            {hasItems ? 'You’re all caught up' : 'No reviews yet'}
          </h2>
          <p className="text-sm text-muted">
            {hasItems
              ? nextDueAt
                ? `Your next review is due ${formatDueDistance(nextDueAt)}.`
                : 'Nothing scheduled right now.'
              : 'Finish problems in a lesson and they’ll show up here for spaced review.'}
          </p>
        </div>
      </div>
      {hasItems ? (
        <Link to="/review/session?mode=ahead">
          <Button variant="secondary" size="lg">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Practice ahead
          </Button>
        </Link>
      ) : (
        <Link to="/courses">
          <Button size="lg">
            Go to lessons
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      )}
    </Card>
  );
}
