import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Play, Pause } from 'lucide-react';
import type { DPTableProps } from '../../types/content';
import {
  computeReachable,
  knapsackTable,
  lookbackIndices,
  minCoinsTable,
  UNREACHABLE,
} from '../../lib/dp';
import { cn } from '../../lib/cn';

interface Props {
  config: DPTableProps;
}

interface Cell {
  r: number;
  c: number;
}

interface FillStep {
  cell: Cell;
  sources: Cell[];
  /** rendered glyph once filled */
  label: string;
  tone: 'true' | 'false' | 'value' | 'none';
  note?: string;
}

interface Plan {
  rows: number;
  cols: number;
  /** Cells already populated before the animation starts (the base case). */
  base: Map<string, FillStep>;
  steps: FillStep[];
  rowLabels: string[];
  colLabels: string[];
  /** Heading text describing the recurrence being run. */
  rule: string;
  /** caption under the table */
  caption?: string;
}

const key = (r: number, c: number) => `${r}:${c}`;

function coinGlyph(n: number): string {
  return n === UNREACHABLE ? '∞' : String(n);
}

function buildPlan(config: DPTableProps): Plan {
  if (config.mode === 'reachability') {
    const { steps, jumpSizes } = config;
    const reach = computeReachable(steps, jumpSizes);
    const base = new Map<string, FillStep>();
    base.set(key(0, 0), {
      cell: { r: 0, c: 0 },
      sources: [],
      label: '✓',
      tone: 'true',
      note: 'ground',
    });
    const fill: FillStep[] = [];
    for (let i = 1; i <= steps; i++) {
      const sources = lookbackIndices(i, jumpSizes).map((c) => ({ r: 0, c }));
      fill.push({
        cell: { r: 0, c: i },
        sources,
        label: reach[i] ? '✓' : '✗',
        tone: reach[i] ? 'true' : 'false',
      });
    }
    return {
      rows: 1,
      cols: steps + 1,
      base,
      steps: fill,
      rowLabels: ['reachable'],
      colLabels: Array.from({ length: steps + 1 }, (_, i) => String(i)),
      rule: `reachable[i] = ${jumpSizes
        .map((j) => `reachable[i-${j}]`)
        .join(' || ')}`,
      caption: config.caption,
    };
  }

  if (config.mode === 'coins') {
    const { coins, amount } = config;
    const best = minCoinsTable(coins, amount);
    const base = new Map<string, FillStep>();
    base.set(key(0, 0), {
      cell: { r: 0, c: 0 },
      sources: [],
      label: '0',
      tone: 'value',
      note: 'make 0 with no coins',
    });
    const fill: FillStep[] = [];
    for (let a = 1; a <= amount; a++) {
      // Source = the coin that achieved the minimum (argmin), if any.
      let bestSource: Cell[] = [];
      if (best[a] !== UNREACHABLE) {
        for (const c of coins) {
          if (a - c >= 0 && best[a - c] + 1 === best[a]) {
            bestSource = [{ r: 0, c: a - c }];
            break;
          }
        }
      }
      fill.push({
        cell: { r: 0, c: a },
        sources: bestSource,
        label: coinGlyph(best[a]),
        tone: best[a] === UNREACHABLE ? 'false' : 'value',
      });
    }
    return {
      rows: 1,
      cols: amount + 1,
      base,
      steps: fill,
      rowLabels: ['minCoins'],
      colLabels: Array.from({ length: amount + 1 }, (_, i) => String(i)),
      rule: `minCoins[a] = 1 + min over coins c of minCoins[a − c]`,
      caption: config.caption,
    };
  }

  // knapsack (2D)
  const { items, capacity } = config;
  const table = knapsackTable(items, capacity);
  const base = new Map<string, FillStep>();
  for (let w = 0; w <= capacity; w++) {
    base.set(key(0, w), {
      cell: { r: 0, c: w },
      sources: [],
      label: '0',
      tone: 'value',
    });
  }
  const fill: FillStep[] = [];
  for (let i = 1; i <= items.length; i++) {
    const { weight, value } = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      const skip = table[i - 1][w];
      const take = weight <= w ? table[i - 1][w - weight] + value : -Infinity;
      const took = take >= skip && weight <= w;
      const sources: Cell[] = [{ r: i - 1, c: w }];
      if (weight <= w) sources.push({ r: i - 1, c: w - weight });
      fill.push({
        cell: { r: i, c: w },
        sources,
        label: String(table[i][w]),
        tone: 'value',
        note: took ? 'take' : 'skip',
      });
    }
  }
  return {
    rows: items.length + 1,
    cols: capacity + 1,
    base,
    steps: fill,
    rowLabels: ['∅', ...items.map((it) => `${it.label} (w${it.weight}/v${it.value})`)],
    colLabels: Array.from({ length: capacity + 1 }, (_, i) => String(i)),
    rule: `best[i][w] = max( best[i−1][w],  value + best[i−1][w − weight] )`,
    caption: config.caption,
  };
}

const toneStyles: Record<FillStep['tone'], string> = {
  true: 'bg-correct-soft border-correct text-correct',
  false: 'bg-wrong-soft border-wrong text-wrong',
  value: 'bg-brand-soft border-brand text-brand',
  none: 'bg-white border-line text-muted',
};

export function DPTable({ config }: Props) {
  const reduce = useReducedMotion();
  const plan = useMemo(() => buildPlan(config), [config]);
  const total = plan.steps.length;

  // How many fill-steps have been revealed. Starts at 0 (only the base case).
  const [revealed, setRevealed] = useState(reduce ? total : 0);
  const [playing, setPlaying] = useState(!reduce);
  const timer = useRef<number | null>(null);

  const stepMs = config.mode === 'knapsack' ? 230 : 360;

  useEffect(() => {
    if (reduce) {
      setRevealed(total);
      setPlaying(false);
      return;
    }
    if (!playing) return;
    if (revealed >= total) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setRevealed((n) => n + 1), stepMs);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, revealed, total, reduce, stepMs]);

  const replay = () => {
    setRevealed(0);
    setPlaying(true);
  };

  const current = revealed > 0 ? plan.steps[revealed - 1] : null;
  const sourceKeys = new Set((current?.sources ?? []).map((s) => key(s.r, s.c)));

  // Map of revealed cells -> their FillStep, including the base case.
  const shown = new Map(plan.base);
  for (let i = 0; i < revealed; i++) {
    const s = plan.steps[i];
    shown.set(key(s.cell.r, s.cell.c), s);
  }

  const done = revealed >= total;

  return (
    <div className="w-full select-none">
      <p className="mx-auto mb-4 max-w-md rounded-lg bg-canvas px-4 py-2 text-center font-mono text-xs text-ink-soft">
        {plan.rule}
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="mx-auto w-max">
          <div className="flex">
            {/* row-label gutter */}
            <div className="flex flex-col">
              <div className="h-7" />
              {Array.from({ length: plan.rows }).map((_, r) => (
                <div
                  key={r}
                  className="flex h-11 items-center justify-end pr-2 text-right text-[11px] font-medium text-muted"
                  style={{ maxWidth: 132 }}
                >
                  {plan.rowLabels[r]}
                </div>
              ))}
            </div>

            <div>
              {/* column headers */}
              <div className="flex gap-1.5 px-0.5">
                {plan.colLabels.map((cl, c) => (
                  <div
                    key={c}
                    className={cn(
                      'flex w-11 min-w-11 items-center justify-center text-xs tabular-nums',
                      current && current.cell.c === c
                        ? 'font-bold text-ink'
                        : 'text-muted',
                    )}
                  >
                    {cl}
                  </div>
                ))}
              </div>

              {/* grid */}
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: plan.rows }).map((_, r) => (
                  <div key={r} className="flex gap-1.5 px-0.5">
                    {Array.from({ length: plan.cols }).map((_, c) => {
                      const cellKey = key(r, c);
                      const step = shown.get(cellKey);
                      const isCurrent =
                        !!current &&
                        current.cell.r === r &&
                        current.cell.c === c;
                      const isSource = sourceKeys.has(cellKey);
                      return (
                        <div
                          key={c}
                          className="flex h-11 w-11 min-w-11 items-center justify-center"
                        >
                          {step ? (
                            <motion.div
                              initial={
                                reduce
                                  ? false
                                  : { scale: 0.5, opacity: 0 }
                              }
                              animate={{
                                scale: isCurrent && !reduce ? 1.12 : 1,
                                opacity: 1,
                              }}
                              transition={{
                                type: 'spring',
                                stiffness: 520,
                                damping: 24,
                              }}
                              className={cn(
                                'flex h-11 w-11 items-center justify-center rounded-lg border-2 text-sm font-bold tabular-nums',
                                toneStyles[step.tone],
                                isCurrent &&
                                  'ring-2 ring-brand ring-offset-2 shadow-sm',
                                isSource &&
                                  'ring-2 ring-brand/50 ring-offset-1',
                              )}
                            >
                              {step.label}
                            </motion.div>
                          ) : (
                            <div
                              className={cn(
                                'flex h-11 w-11 items-center justify-center rounded-lg border-2 border-dashed border-line text-muted',
                                isSource && 'ring-2 ring-brand/50 ring-offset-1',
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* controls + status */}
      <div className="mt-5 flex items-center justify-center gap-3">
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
        <span className="text-xs tabular-nums text-muted">
          {done ? 'complete' : `filling ${revealed} / ${total}`}
        </span>
      </div>

      {current?.note && !done && (
        <p className="mt-2 text-center text-xs font-medium text-brand">
          {current.note === 'take'
            ? 'take this item → look at the row above, capacity − weight'
            : current.note === 'skip'
              ? 'skip this item → copy the value from the row above'
              : current.note}
        </p>
      )}

      {plan.caption && (
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-ink-soft">
          {plan.caption}
        </p>
      )}
    </div>
  );
}
