import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';
import type { StairsToArrayProps } from '../../types/content';
import { computeReachable } from '../../lib/dp';
import { cn } from '../../lib/cn';

interface Props {
  config: StairsToArrayProps;
}

const ARRAY_HEIGHT = 44;

// A read-only morph: each stair "lies down" to become one flat cell in a row.
// On the stairs we show ✓/✗; once flattened the same cells read as a 0/1 bit
// array — so the staircase↔array mapping is something the learner watches.
export function StairsToArray({ config }: Props) {
  const reduce = useReducedMotion();
  const { steps, jumpSizes, highlightIndices, caption } = config;
  const reachable = computeReachable(steps, jumpSizes);
  const highlight = new Set(highlightIndices ?? []);

  const [flat, setFlat] = useState(reduce ? true : false);

  useEffect(() => {
    if (reduce) return;
    const t = window.setTimeout(() => setFlat(true), 1000);
    return () => window.clearTimeout(t);
  }, [reduce]);

  return (
    <div className="w-full select-none">
      <div className="overflow-x-auto pb-2">
        <div
          className={cn(
            'mx-auto flex w-max gap-1.5 px-1',
            flat ? 'items-center' : 'items-end',
          )}
        >
          {reachable.map((r, index) => {
            const height = flat ? ARRAY_HEIGHT : 30 + index * 14;
            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <motion.div
                  layout
                  initial={false}
                  animate={{ height }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 240, damping: 26 }
                  }
                  style={{ height }}
                  className={cn(
                    'flex w-11 min-w-11 items-center justify-center rounded-lg border-2 text-base font-bold tabular-nums',
                    r
                      ? 'border-correct bg-correct-soft text-correct'
                      : 'border-wrong bg-wrong-soft text-wrong',
                    highlight.has(index) && 'ring-2 ring-brand ring-offset-2',
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {flat ? (
                      <motion.span
                        key="bit"
                        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduce ? undefined : { opacity: 0, scale: 0.6 }}
                      >
                        {r ? '1' : '0'}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="icon"
                        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduce ? undefined : { opacity: 0, scale: 0.6 }}
                      >
                        {r ? (
                          <Check className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <X className="h-5 w-5" aria-hidden="true" />
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className="text-xs tabular-nums text-muted">
                  {flat ? `[${index}]` : index}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {!reduce && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setFlat((f) => !f)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-canvas"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {flat ? 'Stand it back up' : 'Lay it flat'}
          </button>
        </div>
      )}

      {caption && (
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-ink-soft">
          {caption}
        </p>
      )}
    </div>
  );
}
