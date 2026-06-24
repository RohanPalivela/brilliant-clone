import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import type { CellMark, StaircaseWalkthroughProps } from '../../types/content';
import { computeReachable, lookbackIndices } from '../../lib/dp';
import { ReachabilityCells } from './ReachabilityCells';
import { cn } from '../../lib/cn';

interface Props {
  config: StaircaseWalkthroughProps;
}

function listSteps(indices: number[]): string {
  if (indices.length === 1) return `step ${indices[0]}`;
  const head = indices.slice(0, -1).map((i) => `step ${i}`).join(', ');
  return `${head} and step ${indices[indices.length - 1]}`;
}

// A self-paced worked example. The learner presses Next / ← → to decide one step
// at a time; each frame draws the look-back arrows into the current step and
// narrates the decision, so nothing is revealed faster than they can absorb.
export function StaircaseWalkthrough({ config }: Props) {
  const { steps, jumpSizes } = config;
  const reachable = computeReachable(steps, jumpSizes);
  const [frame, setFrame] = useState(0);

  const next = useCallback(
    () => setFrame((f) => Math.min(steps, f + 1)),
    [steps],
  );
  const prev = useCallback(() => setFrame((f) => Math.max(0, f - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // Cells 0..frame are decided; the rest stay blank until the learner reaches them.
  const marks: CellMark[] = reachable.map((r, i) =>
    i <= frame ? (r ? 'check' : 'cross') : 'empty',
  );

  const preds = lookbackIndices(frame, jumpSizes);
  const isReachable = reachable[frame];

  let reason: string;
  if (frame === 0) {
    reason = 'The ground. You’re already standing here, so it’s reachable.';
  } else if (preds.length === 0) {
    reason = `No jump of ${jumpSizes.join(' or ')} can land here — they’d start below the ground. So it’s not reachable.`;
  } else {
    const reachablePreds = preds.filter((p) => reachable[p]);
    if (reachablePreds.length > 0) {
      reason = `You can jump here from ${listSteps(reachablePreds)} (already reachable), so step ${frame} is reachable.`;
    } else {
      reason = `Its only ways in are from ${listSteps(preds)} — and those are all unreachable, so step ${frame} is not either.`;
    }
  }

  return (
    <div className="w-full select-none">
      <ReachabilityCells
        variant="stairs"
        steps={steps}
        jumpSizes={jumpSizes}
        marks={marks}
        readOnly
        highlightIndices={[frame]}
        arrowTargets={frame > 0 && preds.length > 0 ? [frame] : []}
        onChange={() => {}}
      />

      {/* Narration — color-coded by the verdict for the current step */}
      <div
        className={cn(
          'mx-auto mt-5 max-w-md rounded-xl border-2 px-4 py-3 text-left',
          frame === 0
            ? 'border-correct bg-correct-soft'
            : isReachable
              ? 'border-correct bg-correct-soft'
              : 'border-wrong bg-wrong-soft',
        )}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-ink">Step {frame}</span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
              isReachable
                ? 'bg-correct text-white'
                : 'bg-wrong text-white',
            )}
          >
            {isReachable ? (
              <>
                <Check className="h-3 w-3" aria-hidden="true" /> Reachable
              </>
            ) : (
              <>
                <X className="h-3 w-3" aria-hidden="true" /> Not reachable
              </>
            )}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">{reason}</p>
      </div>

      {/* Stepper controls */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prev}
          disabled={frame === 0}
          aria-label="Previous step"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors enabled:hover:bg-canvas disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <span className="text-xs font-medium tabular-nums text-muted">
          step {frame} of {steps}
        </span>
        <button
          type="button"
          onClick={next}
          disabled={frame === steps}
          aria-label="Next step"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors enabled:hover:bg-canvas disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {config.caption && (
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-ink-soft">
          {config.caption}
        </p>
      )}
    </div>
  );
}
