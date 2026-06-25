import { motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
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

const coinWord = (n: number) => (n === 1 ? 'coin' : 'coins');

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
      <p className="mb-4 text-center text-sm text-muted">
        Which coin should you lay down to make{' '}
        <span className="font-semibold text-ink">{amount}</span> with the fewest
        coins?
      </p>

      {/* Frame every card the same way: build on a solved smaller amount, add one coin. */}
      <p className="mb-4 text-center text-xs text-muted">
        Each route already makes a smaller amount the cheapest way, then adds one
        coin to land on <span className="font-semibold text-ink">{amount}</span>.
      </p>

      <div className="flex flex-col gap-3">
        {playable.map((coin) => {
          const remainder = amount - coin;
          const subCost = best[remainder];
          const dead = subCost === UNREACHABLE;
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
              aria-label={
                dead
                  ? `Add a ${coin} cent coin — that builds on ${remainder}, which can't be made`
                  : `Made ${remainder} cents in ${subCost} ${coinWord(
                      subCost,
                    )}, plus a ${coin} cent coin`
              }
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
              {/* The coin you'd lay down right now. */}
              <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border-2 border-flame/40 bg-gradient-to-b from-amber-100 to-amber-300 text-base font-extrabold leading-none tabular-nums text-ink dark:from-amber-700/40 dark:to-amber-600/30 dark:text-amber-100">
                {coin}
                <span className="text-[9px] font-semibold opacity-70">¢</span>
              </span>

              <div className="min-w-0 flex-1">
                {dead ? (
                  <>
                    <div className="text-sm font-semibold text-ink">
                      Add a {coin}¢ coin
                    </div>
                    <div className="mt-0.5 text-sm text-wrong">
                      That builds on{' '}
                      <span className="font-semibold">{remainder}</span>, which
                      can’t be made with these coins.
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
                    {/* The already-solved smaller amount you build on. */}
                    <span>
                      Made{' '}
                      <span className="font-bold tabular-nums text-ink">
                        {remainder}¢
                      </span>{' '}
                      in{' '}
                      <span className="font-bold tabular-nums text-ink">
                        {subCost} {coinWord(subCost)}
                      </span>
                    </span>

                    <Plus className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />

                    {/* The one coin this card lays down to reach the target. */}
                    <span>
                      this{' '}
                      <span className="font-bold tabular-nums text-ink">{coin}¢</span>{' '}
                      coin
                    </span>
                  </div>
                )}
              </div>

              {/* No total here — that's the sum the learner has to work out. */}
              {!dead && (
                <span
                  className={cn(
                    'flex shrink-0 flex-col items-center justify-center rounded-lg px-3 py-1.5 leading-tight',
                    isSelected ? 'bg-brand text-white' : 'bg-canvas text-muted',
                  )}
                >
                  <span className="text-base font-extrabold tabular-nums">= ?</span>
                  <span
                    className={cn(
                      'text-[11px] font-medium',
                      isSelected ? 'text-white/80' : 'text-muted',
                    )}
                  >
                    coins total
                  </span>
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
