import { useAuth } from './useAuth';
import { effectiveStreak } from '../data/streak';

/** The streak the learner should see right now (0 if they missed a day). */
export function useStreak(): number {
  const { profile } = useAuth();
  if (!profile) return 0;
  return effectiveStreak(profile.streak, profile.lastActivityDate);
}
