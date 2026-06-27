import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, Home, Flame } from 'lucide-react';
import type { ReviewResult } from './ReviewPlayer';
import { Button } from '../ui/Button';

interface ReviewSummaryProps {
  results: ReviewResult[];
  streak: number;
  /** True when no reviews remain due — today's review goal is met. */
  goalComplete: boolean;
  onDoneToReview: () => void;
  onHome: () => void;
}

export function ReviewSummary({
  results,
  streak,
  goalComplete,
  onDoneToReview,
  onHome,
}: ReviewSummaryProps) {
  const reviewed = results.length;
  const recalled = results.filter((r) => r.correct).length;
  const lapses = results.filter((r) => r.grade === 'again').length;
  const accuracy = reviewed > 0 ? Math.round((recalled / reviewed) * 100) : 0;
  const clean = recalled === reviewed && reviewed > 0;

  useEffect(() => {
    if (!clean) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#16a34a', '#f97316', '#0b1020'],
    });
  }, [clean]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-10 text-center">
      <div className="animate-pop-in w-full max-w-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>

        <h1 className="text-3xl font-bold text-ink">Review done</h1>
        <p className="mt-2 text-muted">
          You strengthened {reviewed} {reviewed === 1 ? 'memory' : 'memories'} today.
        </p>

        {goalComplete && (
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-correct-soft px-4 py-2 font-bold text-correct">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Daily review goal complete
          </div>
        )}

        {streak >= 1 && (
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-flame/10 px-4 py-2 font-bold text-flame">
            <Flame className="h-5 w-5" aria-hidden="true" />
            {streak} day streak!
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-3 text-left">
          <Stat label="Reviewed" value={String(reviewed)} />
          <Stat label="Recalled" value={`${accuracy}%`} />
          <Stat label="Relearned" value={String(lapses)} />
        </div>

        <p className="mt-6 text-sm text-muted">
          Each one you recalled is now scheduled to return later — at a longer
          gap if it was easy, sooner if you stumbled.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" onClick={onDoneToReview} className="w-full">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Back to review
          </Button>
          <Button variant="secondary" size="lg" onClick={onHome} className="w-full">
            <Home className="h-4 w-4" aria-hidden="true" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 text-center shadow-[var(--shadow-card)]">
      <div className="text-2xl font-extrabold text-ink">{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
}
