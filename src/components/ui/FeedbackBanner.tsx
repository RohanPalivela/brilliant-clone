import { Check, X, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/cn';

export type FeedbackState = 'correct' | 'wrong' | 'hint' | null;

interface FeedbackBannerProps {
  state: FeedbackState;
  message: string;
}

const styles = {
  correct: 'bg-correct-soft text-correct border-correct/30',
  wrong: 'bg-wrong-soft text-wrong border-wrong/30',
  hint: 'bg-brand-soft text-brand border-brand/30',
} as const;

export function FeedbackBanner({ state, message }: FeedbackBannerProps) {
  if (!state) return null;
  const Icon = state === 'correct' ? Check : state === 'wrong' ? X : Lightbulb;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'animate-pop-in flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium',
        styles[state],
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
