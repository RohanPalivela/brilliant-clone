import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useReviewItems } from '../hooks/useReviewItems';
import { useStreak } from '../hooks/useStreak';
import { interleave } from '../lib/srs';
import type { ReviewItem } from '../types/review';
import { ReviewPlayer, type ReviewResult } from '../components/review/ReviewPlayer';
import { ReviewSummary } from '../components/review/ReviewSummary';
import { LoadingScreen } from '../components/ui/LoadingScreen';

/** Max problems in one session — short enough to finish, long enough to space. */
const SESSION_SIZE = 15;

export function ReviewSessionPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ahead = params.get('mode') === 'ahead';
  const { loading, items, dueItems, dueCount } = useReviewItems();
  const streak = useStreak();

  // Snapshot the queue once so writes during the session (which change due
  // dates) can't reshuffle the problems out from under the learner.
  const [queue, setQueue] = useState<ReviewItem[] | null>(null);
  const [results, setResults] = useState<ReviewResult[] | null>(null);

  useEffect(() => {
    if (loading || queue) return;
    const pool = ahead
      ? [...items].sort((a, b) => a.dueAt - b.dueAt)
      : dueItems;
    setQueue(interleave(pool.slice(0, SESSION_SIZE)));
  }, [loading, queue, ahead, items, dueItems]);

  if (loading || !queue) return <LoadingScreen label="Building your review…" />;

  if (results) {
    return (
      <ReviewSummary
        results={results}
        streak={streak}
        goalComplete={dueCount === 0}
        onDoneToReview={() => navigate('/review')}
        onHome={() => navigate('/')}
      />
    );
  }

  if (queue.length === 0) return <Navigate to="/review" replace />;

  return (
    <ReviewPlayer
      queue={queue}
      onDone={setResults}
      onExit={() => navigate('/review')}
    />
  );
}
