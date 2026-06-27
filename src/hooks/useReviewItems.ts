import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { subscribeReviewItems } from '../data/reviewService';
import { summarizeMastery } from '../lib/srs';
import { REVIEW_SKILLS } from '../content/skills';
import type { ReviewItem, SkillMastery } from '../types/review';

interface ReviewState {
  items: ReviewItem[];
  loading: boolean;
  /** Items due for review right now (dueAt <= now). */
  dueItems: ReviewItem[];
  dueCount: number;
  /** Per-skill mastery, only for skills the learner has started. */
  mastery: SkillMastery[];
  /** Soonest upcoming due date among not-yet-due items, or null. */
  nextDueAt: number | null;
}

/** Live spaced-repetition state for the signed-in learner. */
export function useReviewItems(): ReviewState {
  const { user } = useAuth();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeReviewItems(user.uid, (next) => {
      setItems(next);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return useMemo(() => {
    const now = Date.now();
    const dueItems = items.filter((it) => it.dueAt <= now);
    const upcoming = items
      .filter((it) => it.dueAt > now)
      .map((it) => it.dueAt)
      .sort((a, b) => a - b);
    return {
      items,
      loading,
      dueItems,
      dueCount: dueItems.length,
      mastery: summarizeMastery(items, REVIEW_SKILLS, now),
      nextDueAt: upcoming.length > 0 ? upcoming[0] : null,
    };
  }, [items, loading]);
}
