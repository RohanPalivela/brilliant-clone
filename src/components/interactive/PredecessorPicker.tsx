import type { KeyboardEvent } from 'react';
import type { PredecessorPickerProps, SlideAnswer } from '../../types/content';
import { lookbackIndices } from '../../lib/dp';
import { cn } from '../../lib/cn';

interface Props {
  config: PredecessorPickerProps;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  showMistakes?: boolean;
}

/**
 * "Tap the cells this one depends on." The learner selects the look-backs of
 * `target` (the indices `target − j`). It isolates the recurrence: there's no
 * way to answer by simulating jumps forward — you must reason backward. Works
 * for any jump set, including non-contiguous ones a window can't express.
 */
export function PredecessorPicker({ config, answer, onAnswer, showMistakes }: Props) {
  const { steps, jumpSizes, target, variant = 'array', name, moveLabel = 'jumps' } =
    config;
  const noun = variant === 'array' ? 'cell' : 'step';
  const selected = answer.kind === 'range' ? answer.indices : [];
  const selectedSet = new Set(selected);
  const correctSet = new Set(lookbackIndices(target, jumpSizes));

  const toggle = (index: number) => {
    if (index === target) return;
    const next = selectedSet.has(index)
      ? selected.filter((i) => i !== index)
      : [...selected, index];
    onAnswer({ kind: 'range', indices: next.sort((a, b) => a - b) });
  };

  const onKey = (e: KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(index);
    }
  };

  const cells = Array.from({ length: steps + 1 }, (_, i) => i);

  const labelFor = (index: number) => {
    const Noun = noun === 'cell' ? 'Cell' : 'Step';
    if (index === target) return `${Noun} ${index} — the ${noun} you're deciding`;
    const state = selectedSet.has(index) ? 'selected' : 'not selected';
    return `${Noun} ${index}, ${state}`;
  };

  return (
    <div className="w-full select-none">
      {name && (
        <div className="mb-2 text-center text-xs font-medium tracking-wide text-muted">
          {name}
        </div>
      )}
      <p className="mb-6 text-center text-sm text-muted">
        Deciding{' '}
        <span className="font-semibold text-ink">
          {noun} {target}
        </span>{' '}
        · {moveLabel} {jumpSizes.join(', ')}
      </p>

      <div className="w-full overflow-x-auto pb-2">
        <div
          className={cn(
            'mx-auto flex w-max gap-1.5 px-1',
            variant === 'stairs' ? 'items-end' : 'items-center',
          )}
        >
          {cells.map((index) => {
            const isTarget = index === target;
            const isSelected = selectedSet.has(index);
            // Mistakes: a pick that isn't a real look-back (over-selected), or a
            // look-back the learner left out (missed).
            const isOverselected =
              showMistakes && !isTarget && isSelected && !correctSet.has(index);
            const isMissed =
              showMistakes && !isTarget && !isSelected && correctSet.has(index);
            const height = variant === 'stairs' ? 30 + index * 14 : undefined;

            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  data-cell-index={index}
                  aria-label={labelFor(index)}
                  aria-pressed={isTarget ? undefined : isSelected}
                  disabled={isTarget}
                  onClick={() => toggle(index)}
                  onKeyDown={(e) => onKey(e, index)}
                  style={{
                    height: height ? `${height}px` : undefined,
                    touchAction: 'manipulation',
                  }}
                  className={cn(
                    'relative flex w-11 min-w-11 items-center justify-center rounded-lg border-2 text-base font-bold tabular-nums transition-all duration-100',
                    variant === 'array' && 'h-11',
                    isTarget
                      ? 'cursor-default border-cta bg-cta text-white'
                      : isSelected
                        ? 'cursor-pointer border-brand bg-brand-soft text-brand'
                        : 'cursor-pointer border-line bg-surface text-muted hover:brightness-95',
                    isOverselected && 'ring-2 ring-wrong ring-offset-2 animate-pop-in',
                    isMissed &&
                      'border-dashed border-wrong text-wrong ring-2 ring-wrong/40',
                  )}
                >
                  {isTarget ? '?' : ''}
                </button>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    isTarget || isSelected
                      ? 'font-semibold text-ink'
                      : 'text-muted',
                  )}
                >
                  {variant === 'array' ? `[${index}]` : index}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-sm">
        <span className="text-muted">Selected: </span>
        <span className="font-semibold text-ink">
          {selected.length ? `{${selected.join(', ')}}` : '—'}
        </span>
      </p>

      {config.caption && (
        <p className="mt-2 text-center text-xs text-muted">{config.caption}</p>
      )}
    </div>
  );
}
