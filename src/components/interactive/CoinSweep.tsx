import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import type { CellMark, CoinSweepProps } from '../../types/content';
import { computeReachable } from '../../lib/dp';
import { ReachabilityCells } from './ReachabilityCells';
import { cn } from '../../lib/cn';

interface Props {
  config: CoinSweepProps;
}

// One frame ≈ how long a learner needs to read the look-back for one amount.
const STEP_MS = 950;

// A coin token. `tone` tints it when it's the look-back that makes the amount.
function CoinChip({ value, tone }: { value: number; tone: 'gold' | 'win' | 'dead' }) {
  const palette =
    tone === 'win'
      ? { bg: 'var(--color-correct-soft)', ring: 'var(--color-correct)', text: 'var(--color-correct)' }
      : tone === 'dead'
        ? { bg: 'var(--color-wrong-soft)', ring: 'var(--color-wrong)', text: 'var(--color-wrong)' }
        : { bg: '#FBEFC8', ring: '#D9A521', text: '#9A6B0E' };
  return (
    <span
      className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border-2 px-1.5 text-xs font-extrabold tabular-nums shadow-sm"
      style={{ background: palette.bg, borderColor: palette.ring, color: palette.text }}
    >
      {value}¢
    </span>
  );
}

// Read-only "watch it run" sweep for coin-change feasibility. It fills can_make[]
// bottom-up — exactly the staircase reachability sweep, only the row is named for
// amounts and the moves are coins. Each frame draws the look-back arrows (amount −
// coin) into the current cell and narrates which coin lands it, so the learner
// sees the coin problem *is* the staircase, not just like it.
export function CoinSweep({ config }: Props) {
  const { coins, amount } = config;
  const reduce = useReducedMotion();

  const reachable = computeReachable(amount, coins);

  const [frame, setFrame] = useState(reduce ? amount : 0);
  const [playing, setPlaying] = useState(!reduce);
  const timer = useRef<number | null>(null);

  const done = frame >= amount;

  useEffect(() => {
    if (reduce || !playing) return;
    if (done) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setFrame((f) => f + 1), STEP_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, frame, done, reduce]);

  const step = useCallback(
    (delta: number) => {
      setPlaying(false);
      setFrame((f) => Math.min(amount, Math.max(0, f + delta)));
    },
    [amount],
  );

  const replay = () => {
    setFrame(0);
    setPlaying(true);
  };

  // Cells 0..frame are decided; the rest stay blank until the sweep reaches them.
  const marks: CellMark[] = reachable.map((r, i) =>
    i <= frame ? (r ? 'check' : 'cross') : 'empty',
  );

  // The look-backs the current amount reads: amount − coin for each coin.
  const lookbacks = coins
    .map((coin) => ({ coin, pred: frame - coin }))
    .filter(({ pred }) => pred >= 0)
    .sort((a, b) => a.pred - b.pred);

  const madeBy = lookbacks.filter(({ pred }) => reachable[pred]);
  const isMakeable = reachable[frame];

  let verdict: string;
  if (frame === 0) {
    verdict = 'The base case. You can always make 0 — by spending no coins at all.';
  } else if (lookbacks.length === 0) {
    verdict = `Every coin is larger than ${frame}, so there’s no smaller amount to build on. Not makeable.`;
  } else if (madeBy.length > 0) {
    const c = madeBy[0];
    verdict = `Drop one ${c.coin}¢ coin onto the makeable ${c.pred}, and you’ve made ${frame}.`;
  } else {
    verdict = `Each look-back lands on an amount you couldn’t make either, so ${frame} is out of reach.`;
  }

  return (
    <div className="w-full select-none">
      {/* The coins you have to work with. */}
      <div className="mb-5 flex items-center justify-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Your coins
        </span>
        {coins.map((c) => (
          <CoinChip key={c} value={c} tone="gold" />
        ))}
      </div>

      <div className="mb-2 text-center text-xs font-medium tracking-wide text-muted">
        can_make[]
      </div>

      <ReachabilityCells
        variant="array"
        steps={amount}
        jumpSizes={coins}
        marks={marks}
        readOnly
        display="binary"
        highlightIndices={[frame]}
        arrowTargets={frame > 0 ? [frame] : []}
        onChange={() => {}}
      />

      {/* Per-amount narration: the look-backs as coin drops, then the verdict. */}
      <div
        className={cn(
          'mx-auto mt-5 max-w-md rounded-xl border-2 px-4 py-3 text-left',
          isMakeable ? 'border-correct bg-correct-soft' : 'border-wrong bg-wrong-soft',
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-ink">Amount {frame}</span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-white',
              isMakeable ? 'bg-correct' : 'bg-wrong',
            )}
          >
            {isMakeable ? (
              <>
                <Check className="h-3 w-3" aria-hidden="true" /> Makeable
              </>
            ) : (
              <>
                <X className="h-3 w-3" aria-hidden="true" /> Not makeable
              </>
            )}
          </span>
        </div>

        {frame > 0 && lookbacks.length > 0 && (
          <div className="mb-2 flex flex-col gap-1.5">
            {lookbacks.map(({ coin, pred }) => (
              <div key={coin} className="flex items-center gap-2 text-sm">
                <CoinChip
                  value={coin}
                  tone={reachable[pred] ? 'win' : 'dead'}
                />
                <span className="font-mono tabular-nums text-ink-soft">
                  {frame} − {coin} = {pred}
                </span>
                {reachable[pred] ? (
                  <Check className="h-4 w-4 text-correct" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4 text-wrong" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-sm leading-relaxed text-ink-soft">{verdict}</p>
      </div>

      {/* Transport: autoplay with scrubbing, mirroring the staircase walkthrough. */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={frame === 0}
          aria-label="Previous amount"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors enabled:hover:bg-canvas disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        {!reduce && (
          <button
            type="button"
            onClick={() => {
              if (done) replay();
              else setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-canvas"
          >
            {done ? (
              <>
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Replay
              </>
            ) : playing ? (
              <>
                <Pause className="h-4 w-4" aria-hidden="true" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden="true" /> Play
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => step(1)}
          disabled={frame === amount}
          aria-label="Next amount"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors enabled:hover:bg-canvas disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="mx-auto mt-4 max-w-md rounded-lg bg-brand-soft px-4 py-2 text-center text-sm font-semibold text-brand">
        It’s the staircase, repainted: a coin is a jump, an amount is a step, and
        can_make[a] is reachable[a] all over again.
      </p>

      {config.caption && (
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-ink-soft">
          {config.caption}
        </p>
      )}
    </div>
  );
}
