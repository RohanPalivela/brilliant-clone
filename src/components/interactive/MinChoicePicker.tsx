import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Coins, Check } from 'lucide-react';
import type { MinChoicePickerProps, SlideAnswer } from '../../types/content';
import { minCoinsTable, UNREACHABLE } from '../../lib/dp';
import { optimalFirstCoins } from '../../lib/validation';
import { cn } from '../../lib/cn';

interface Props {
  config: MinChoicePickerProps;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  showMistakes?: boolean;
}

/**
 * Pick which coin to lay down first to make `amount` cheapest. Each card shows
 * an already-solved subproblem cost best[amount − coin]; choosing a card is the
 * argmin step of the min-coins recurrence — a comparative selection mechanic,
 * not a cell classification. Option id = `c<coin>`, validated by `minCoinChoice`.
 */
export function MinChoicePicker({ config, answer, onAnswer, showMistakes }: Props) {
  const reduce = useReducedMotion();
  const { coins, amount } = config;
  const selected = answer.kind === 'choice' ? answer.selectedIds : [];
  const selectedId = selected[0];

  const best = minCoinsTable(coins, amount);
  const optimalSet = new Set(optimalFirstCoins(coins, amount));

  const choose = (coin: number) => {
    onAnswer({ kind: 'choice', selectedIds: [`c${coin}`] });
  };

  // Only coins that actually fit are real choices.
  const playable = coins.filter((c) => amount - c >= 0);

  return (
    <div className="w-full select-none">
      <p className="mb-5 text-center text-sm text-muted">
        Cheapest way to make{' '}
        <span className="font-semibold text-ink">{amount}</span> — choose the first
        coin to lay down
      </p>

      <div className="flex flex-col gap-3">
        {playable.map((coin) => {
          const remainder = amount - coin;
          const subCost = best[remainder];
          const dead = subCost === UNREACHABLE;
          const totalCost = dead ? null : subCost + 1;
          const id = `c${coin}`;
          const isSelected = selectedId === id;
          const isOptimal = optimalSet.has(coin);
          const wrongPick = showMistakes && isSelected && !isOptimal;
          const missedBest = showMistakes && !isSelected && isOptimal;

          return (
            <motion.button
              key={coin}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Lay down a ${coin} coin, then make ${remainder}`}
              disabled={dead}
              onClick={() => choose(coin)}
              whileTap={reduce || dead ? undefined : { scale: 0.99 }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors',
                dead
                  ? 'cursor-not-allowed border-line bg-canvas opacity-60'
                  : isSelected
                    ? 'border-brand bg-brand-soft'
                    : 'border-line bg-surface hover:border-brand/40',
                wrongPick && 'border-wrong ring-2 ring-wrong/40',
                missedBest && 'border-dashed border-correct ring-2 ring-correct/40',
              )}
            >
              {/* The coin you'd lay down */}
              <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border-2 border-flame/40 bg-gradient-to-b from-amber-100 to-amber-300 text-base font-extrabold tabular-nums text-ink dark:from-amber-700/40 dark:to-amber-600/30 dark:text-amber-100">
                {coin}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <span>
                    make{' '}
                    <span className="font-semibold tabular-nums text-ink">
                      {remainder}
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                  {dead ? (
                    <span className="font-semibold text-wrong">can’t be made</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-ink">
                      <Coins className="h-3.5 w-3.5 text-flame" aria-hidden="true" />
                      <span className="tabular-nums">{subCost}</span>
                      <span className="font-normal text-muted">already solved</span>
                    </span>
                  )}
                </div>
                {!dead && (
                  <div className="mt-0.5 font-mono text-xs text-muted">
                    1 + best[{remainder}] = {totalCost}
                  </div>
                )}
              </div>

              {!dead && (
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-bold tabular-nums',
                    isSelected ? 'bg-brand text-white' : 'bg-canvas text-ink',
                  )}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  {totalCost} coins
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {config.caption && (
        <p className="mt-4 text-center text-xs text-muted">{config.caption}</p>
      )}
    </div>
  );
}
