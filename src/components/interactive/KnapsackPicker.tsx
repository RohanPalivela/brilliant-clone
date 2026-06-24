import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Gem, Weight, Check } from 'lucide-react';
import type { KnapsackPickerProps, SlideAnswer } from '../../types/content';
import { knapsackOptimal } from '../../lib/dp';
import { cn } from '../../lib/cn';

interface Props {
  config: KnapsackPickerProps;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  showMistakes?: boolean;
}

export function KnapsackPicker({ config, answer, onAnswer, showMistakes }: Props) {
  const reduce = useReducedMotion();
  const { items, capacity, showOptimal } = config;
  const selected = answer.kind === 'items' ? answer.selectedIds : [];
  const selectedSet = new Set(selected);

  const chosen = items.filter((it) => selectedSet.has(it.id));
  const weight = chosen.reduce((s, it) => s + it.weight, 0);
  const value = chosen.reduce((s, it) => s + it.value, 0);
  const over = weight > capacity;
  const optimal = knapsackOptimal(items, capacity);

  const toggle = (id: string) => {
    const next = selectedSet.has(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    onAnswer({ kind: 'items', selectedIds: next });
  };

  const fillPct = Math.min(100, (weight / capacity) * 100);

  return (
    <div className="w-full select-none">
      {/* Item shelf */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it) => {
          const isSel = selectedSet.has(it.id);
          return (
            <motion.button
              key={it.id}
              type="button"
              onClick={() => toggle(it.id)}
              whileTap={reduce ? undefined : { scale: 0.95 }}
              animate={
                reduce
                  ? undefined
                  : { y: isSel ? -2 : 0 }
              }
              className={cn(
                'relative flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-colors',
                isSel
                  ? 'border-brand bg-brand-soft shadow-sm'
                  : 'border-line bg-surface hover:border-brand/40',
              )}
            >
              <span className="text-sm font-bold text-ink">{it.label}</span>
              <span className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-muted">
                  <Weight className="h-3.5 w-3.5" aria-hidden="true" />
                  {it.weight}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-brand">
                  <Gem className="h-3.5 w-3.5" aria-hidden="true" />
                  {it.value}
                </span>
              </span>
              <AnimatePresence>
                {isSel && (
                  <motion.span
                    initial={reduce ? false : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={reduce ? undefined : { scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Backpack / capacity meter */}
      <div className="mt-6 rounded-2xl border border-line bg-canvas p-4">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-semibold text-ink">Backpack</span>
          <span
            className={cn(
              'font-mono tabular-nums',
              over ? 'font-bold text-wrong' : 'text-ink-soft',
            )}
          >
            {weight} / {capacity} weight
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-line">
          <motion.div
            className={cn('h-3 rounded-full', over ? 'bg-wrong' : 'bg-brand')}
            animate={{ width: `${fillPct}%` }}
            transition={
              reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 30 }
            }
          />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Total value
            </p>
            <div className="flex items-center gap-1.5 text-brand">
              <Gem className="h-5 w-5" aria-hidden="true" />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={value}
                  initial={reduce ? false : { y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: -8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 26 }}
                  className="text-3xl font-extrabold tabular-nums"
                >
                  {value}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {showOptimal && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted">Best possible</p>
              <p className="text-lg font-bold tabular-nums text-ink-soft">{optimal}</p>
            </div>
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
              Over capacity — drop something before you can carry this.
            </motion.p>
          )}
          {showMistakes && !over && value < optimal && (
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-center text-sm font-medium text-ink-soft"
            >
              It fits, but you can squeeze out more value. Best possible is {optimal}.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
