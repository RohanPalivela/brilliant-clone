import { useReviewItems } from '../hooks/useReviewItems';
import { useAuth } from '../hooks/useAuth';
import { MasteryMap } from '../components/review/MasteryMap';
import { DailyReviewGoal } from '../components/review/DailyReviewGoal';
import { LoadingScreen } from '../components/ui/LoadingScreen';

export function ReviewPage() {
  const { loading, items, dueCount, mastery, nextDueAt } = useReviewItems();
  const { profile } = useAuth();

  if (loading) return <LoadingScreen label="Loading your reviews…" />;

  const hasItems = items.length > 0;
  const reviewsToday = profile?.reviewsCompletedToday ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Daily review</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Understanding fades without spacing. Problems you’ve solved come back
          here at growing intervals — and patterns you mix up return sooner — so
          DP sticks for good, not just for the lesson.
        </p>
      </div>

      <DailyReviewGoal
        dueCount={dueCount}
        reviewsToday={reviewsToday}
        hasItems={hasItems}
        nextDueAt={nextDueAt}
      />

      {/* Mastery map */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Pattern mastery
        </h2>
        <MasteryMap mastery={mastery} />
      </section>
    </div>
  );
}
