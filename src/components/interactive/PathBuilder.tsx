import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Undo2, RotateCcw, Flag, PartyPopper } from 'lucide-react';
import type { PathBuilderProps, SlideAnswer } from '../../types/content';
import { cn } from '../../lib/cn';

interface Props {
  config: PathBuilderProps;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  showMistakes?: boolean;
}

/**
 * Build an ordered sequence of jumps so a climber lands exactly on `target`.
 * A construction mechanic that reasons *forward* — the complement to the
 * backward look-back the table uses. Jumps that would overshoot the goal are
 * blocked, so the only win is landing precisely; dead ends force an undo.
 */
export function PathBuilder({ config, answer, onAnswer, showMistakes }: Props) {
  const reduce = useReducedMotion();
  const { jumpSizes, target } = config;
  const height = Math.max(config.height ?? target, target);
  const jumps = answer.kind === 'path' ? answer.jumps : [];

  const position = jumps.reduce((s, j) => s + j, 0);
  const landed = position === target;
  // The set of positions the climber has stood on (for the trail markers).
  const visited = new Set<number>([0]);
  jumps.reduce((p, j) => {
    const next = p + j;
    visited.add(next);
    return next;
  }, 0);

  // A jump is available only if it doesn't carry the climber past the goal.
  const canJump = (j: number) => !landed && position + j <= target;
  const stuck = !landed && jumpSizes.every((j) => position + j > target);

  const push = (j: number) => {
    if (!canJump(j)) return;
    onAnswer({ kind: 'path', jumps: [...jumps, j] });
  };
  const undo = () => onAnswer({ kind: 'path', jumps: jumps.slice(0, -1) });
  const reset = () => onAnswer({ kind: 'path', jumps: [] });

  const steps = Array.from({ length: height + 1 }, (_, i) => i);

  return (
    <div className="w-full select-none">
      {/* Staircase with the climber */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="mx-auto flex w-max items-end gap-1 px-1">
          {steps.map((i) => {
            const isTarget = i === target;
            const isHere = i === position;
            const onTrail = visited.has(i);
            const stepHeight = 18 + i * 12;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                {/* Climber marker hovers above the current step */}
                <div className="flex h-6 items-end justify-center">
                  <AnimatePresence>
                    {isHere && (
                      <motion.div
                        layoutId={reduce ? undefined : 'climber'}
                        initial={reduce ? false : { y: -6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                        className={cn(
                          'h-4 w-4 rounded-full border-2 border-white shadow',
                          landed ? 'bg-correct' : 'bg-cta',
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </AnimatePresence>
                </div>
                <div
                  data-step={i}
                  style={{ height: `${stepHeight}px`, touchAction: 'manipulation' }}
                  className={cn(
                    'flex w-7 min-w-7 items-start justify-center rounded-t-md border-2 pt-1 text-[10px] font-bold tabular-nums transition-colors',
                    isTarget
                      ? landed
                        ? 'border-correct bg-correct-soft text-correct'
                        : 'border-cta bg-canvas text-cta'
                      : onTrail
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-line bg-surface text-muted',
                  )}
                >
                  {isTarget ? (
                    <Flag className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    i
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] tabular-nums',
                    isHere || isTarget ? 'font-semibold text-ink' : 'text-muted',
                  )}
                >
                  {i}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status line */}
      <p className="mt-3 text-center text-sm">
        <span className="text-muted">On step </span>
        <span className="font-semibold tabular-nums text-ink">{position}</span>
        <span className="text-muted"> · goal </span>
        <span className="font-semibold tabular-nums text-ink">{target}</span>
        {jumps.length > 0 && (
          <span className="ml-2 font-mono text-xs text-muted">
            {jumps.join(' + ')} = {position}
          </span>
        )}
      </p>

      {/* Jump controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {jumpSizes.map((j) => (
          <button
            key={j}
            type="button"
            onClick={() => push(j)}
            disabled={!canJump(j)}
            aria-label={`Jump up ${j}`}
            className={cn(
              'rounded-xl border-2 px-4 py-2 text-sm font-bold tabular-nums transition-colors',
              canJump(j)
                ? 'border-brand bg-surface text-brand hover:bg-brand-soft'
                : 'cursor-not-allowed border-line bg-canvas text-muted opacity-60',
            )}
          >
            +{j}
          </button>
        ))}
        <div className="mx-1 h-6 w-px bg-line" />
        <button
          type="button"
          onClick={undo}
          disabled={jumps.length === 0}
          aria-label="Undo last jump"
          className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-medium text-muted enabled:hover:text-ink disabled:opacity-50"
        >
          <Undo2 className="h-4 w-4" aria-hidden="true" />
          Undo
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={jumps.length === 0}
          aria-label="Reset path"
          className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-medium text-muted enabled:hover:text-ink disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <AnimatePresence>
        {landed && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0 }}
            className="mt-4 flex items-center justify-center gap-1.5 text-center text-sm font-semibold text-correct"
          >
            <PartyPopper className="h-4 w-4" aria-hidden="true" />
            Landed on {target} exactly with {jumps.join(' + ')}.
          </motion.p>
        )}
        {stuck && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0 }}
            className="mt-4 text-center text-sm font-semibold text-wrong"
          >
            Dead end — every jump from {position} overshoots {target}. Undo and try
            another mix.
          </motion.p>
        )}
        {showMistakes && !landed && !stuck && (
          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm font-medium text-ink-soft"
          >
            Not there yet — you’re on {position}, keep jumping until you land on{' '}
            {target}.
          </motion.p>
        )}
      </AnimatePresence>

      {config.caption && (
        <p className="mt-3 text-center text-xs text-muted">{config.caption}</p>
      )}
    </div>
  );
}
