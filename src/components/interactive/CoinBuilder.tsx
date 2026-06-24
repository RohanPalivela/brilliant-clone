import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, RotateCcw, Check } from 'lucide-react';
import type { CoinBuilderProps, SlideAnswer } from '../../types/content';
import { minCoinsTable, UNREACHABLE } from '../../lib/dp';
import { cn } from '../../lib/cn';

interface Props {
  config: CoinBuilderProps;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  showMistakes?: boolean;
}

/**
 * Build a target amount by dropping coins into a tray. A construction mechanic:
 * the learner assembles a concrete solution and watches the running total,
 * rather than classifying cells. In `fewest` mode the win condition also asks
 * for the minimum number of coins.
 */
export function CoinBuilder({ config, answer, onAnswer, showMistakes }: Props) {
  const reduce = useReducedMotion();
  const { coins, target, fewest, showFewest } = config;
  const picks = answer.kind === 'coins' ? answer.picks : [];

  const total = picks.reduce((s, c) => s + c, 0);
  const over = total > target;
  const exact = total === target;
  const fillPct = Math.min(100, (total / target) * 100);

  const bestTable = minCoinsTable(coins, target);
  const fewestPossible = bestTable[target];
  const hasFewest = fewestPossible !== UNREACHABLE;
  const isFewest = exact && picks.length === fewestPossible;
  // The win the slide actually checks for.
  const solved = fewest ? isFewest : exact;

  const add = (c: number) => {
    onAnswer({ kind: 'coins', picks: [...picks, c] });
  };

  const removeAt = (index: number) => {
    onAnswer({ kind: 'coins', picks: picks.filter((_, i) => i !== index) });
  };

  const reset = () => onAnswer({ kind: 'coins', picks: [] });

  return (
    <div className="w-full select-none">
      {/* Coin shelf — tap to drop a coin into the tray */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {coins.map((c) => (
          <motion.button
            key={c}
            type="button"
            onClick={() => add(c)}
            aria-label={`Add a ${c} coin`}
            whileTap={reduce ? undefined : { scale: 0.9 }}
            className="group relative flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-flame/40 bg-gradient-to-b from-amber-100 to-amber-300 text-ink shadow-sm transition-colors hover:border-flame dark:from-amber-700/40 dark:to-amber-600/30 dark:text-amber-100"
          >
            <span className="text-xl font-extrabold tabular-nums leading-none">
              {c}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-medium uppercase tracking-wide text-flame opacity-0 transition-opacity group-hover:opacity-100">
              <Plus className="h-3 w-3" aria-hidden="true" />
              add
            </span>
          </motion.button>
        ))}
      </div>

      {/* Tray + running total */}
      <div className="mt-6 rounded-2xl border border-line bg-canvas p-4">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-semibold text-ink">Your coins</span>
          <span
            className={cn(
              'font-mono tabular-nums',
              over ? 'font-bold text-wrong' : exact ? 'font-bold text-correct' : 'text-ink-soft',
            )}
          >
            {total} / {target}
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-line">
          <motion.div
            className={cn(
              'h-3 rounded-full',
              over ? 'bg-wrong' : exact ? 'bg-correct' : 'bg-brand',
            )}
            animate={{ width: `${fillPct}%` }}
            transition={
              reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 30 }
            }
          />
        </div>

        {/* The picked coins as removable chips */}
        <div className="mt-4 flex min-h-[3rem] flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {picks.length === 0 ? (
              <span className="text-sm text-muted">
                Tap a coin above to start building.
              </span>
            ) : (
              picks.map((c, i) => (
                <motion.button
                  key={`${i}-${c}`}
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`Remove ${c} coin`}
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={reduce ? undefined : { scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 24 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-flame/40 bg-gradient-to-b from-amber-100 to-amber-300 text-sm font-bold tabular-nums text-ink hover:border-wrong dark:from-amber-700/40 dark:to-amber-600/30 dark:text-amber-100"
                >
                  {c}
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Coins used</p>
            <div className="flex items-center gap-1.5 text-ink">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={picks.length}
                  initial={reduce ? false : { y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: -8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 26 }}
                  className="text-3xl font-extrabold tabular-nums"
                >
                  {picks.length}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {(showFewest || fewest) && hasFewest && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted">Fewest possible</p>
              <p className="text-lg font-bold tabular-nums text-ink-soft">
                {fewestPossible}
              </p>
            </div>
          )}

          {picks.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>

        <AnimatePresence>
          {over && (
            <motion.p
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduce ? undefined : { opacity: 0, height: 0 }}
              className="mt-3 text-center text-sm font-semibold text-wrong"
            >
              That overshoots {target}. Remove a coin and try a different mix.
            </motion.p>
          )}
          {solved && (
            <motion.p
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduce ? undefined : { opacity: 0, height: 0 }}
              className="mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-semibold text-correct"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {fewest
                ? `Exactly ${target} in the fewest coins.`
                : `That makes ${target}.`}
            </motion.p>
          )}
          {showMistakes && fewest && exact && !isFewest && (
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-center text-sm font-medium text-ink-soft"
            >
              That makes {target}, but with {picks.length} coins — it can be done in{' '}
              {fewestPossible}.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {config.caption && (
        <p className="mt-3 text-center text-xs text-muted">{config.caption}</p>
      )}
    </div>
  );
}
