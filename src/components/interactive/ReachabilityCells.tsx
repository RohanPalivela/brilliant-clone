import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from 'react';
import { Check, X } from 'lucide-react';
import type { CellMark } from '../../types/content';
import { computeReachable, lookbackIndices } from '../../lib/dp';
import { nextMark } from '../../lib/answers';
import { cn } from '../../lib/cn';

interface ReachabilityCellsProps {
  variant: 'stairs' | 'array';
  steps: number;
  jumpSizes: number[];
  marks: CellMark[];
  onChange: (marks: CellMark[]) => void;
  readOnly?: boolean;
  /** Outline cells that disagree with the correct reachability map. */
  showMistakes?: boolean;
  /** Cells that stay highlighted regardless of pointer/focus (reveal look-backs). */
  highlightIndices?: number[];
  /** Cells 0..lockedUpTo cannot be edited (pre-filled, like the ground cell). */
  lockedUpTo?: number;
}

const markStyles: Record<CellMark, string> = {
  empty: 'bg-white border-line text-muted',
  check: 'bg-correct-soft border-correct text-correct',
  cross: 'bg-wrong-soft border-wrong text-wrong',
};

export function ReachabilityCells({
  variant,
  steps,
  jumpSizes,
  marks,
  onChange,
  readOnly = false,
  showMistakes = false,
  highlightIndices,
  lockedUpTo = 0,
}: ReachabilityCellsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const drag = useRef<{ active: boolean; mark: CellMark }>({
    active: false,
    mark: 'empty',
  });

  useEffect(() => {
    const stop = () => {
      drag.current.active = false;
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  const reachable = computeReachable(steps, jumpSizes);
  const persistent = highlightIndices ?? [];
  const active = activeIndex !== null ? lookbackIndices(activeIndex, jumpSizes) : [];
  const highlight =
    persistent.length || active.length ? new Set([...persistent, ...active]) : null;
  const isLocked = (index: number) => index <= lockedUpTo;

  const setMark = (index: number, mark: CellMark) => {
    if (readOnly || isLocked(index)) return;
    if (marks[index] === mark) return;
    const next = marks.slice();
    next[index] = mark;
    onChange(next);
  };

  const handlePointerDown = (index: number) => {
    if (readOnly || isLocked(index)) return;
    const target = nextMark(marks[index]);
    drag.current = { active: true, mark: target };
    setMark(index, target);
    setActiveIndex(index);
  };

  // Paint across cells (works for mouse and touch) via the cell under the pointer.
  const handleContainerPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>('[data-cell-index]');
    if (!el) return;
    const index = Number(el.dataset.cellIndex);
    setActiveIndex(index);
    if (drag.current.active) setMark(index, drag.current.mark);
  };

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    if (readOnly || isLocked(index)) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMark(index, nextMark(marks[index]));
      setActiveIndex(index);
    }
  };

  const labelFor = (index: number, mark: CellMark) => {
    const state =
      mark === 'check' ? 'reachable' : mark === 'cross' ? 'not reachable' : 'unmarked';
    const note = index === 0 ? ' (start)' : isLocked(index) ? ' (given)' : '';
    return `Step ${index}, ${state}${note}`;
  };

  return (
    <div
      className="w-full overflow-x-auto pb-2"
      onPointerMove={handleContainerPointerMove}
      onPointerLeave={() => setActiveIndex(null)}
    >
      <div
        className={cn(
          'mx-auto flex w-max gap-1.5 px-1',
          variant === 'stairs' ? 'items-end' : 'items-center',
        )}
      >
        {marks.map((mark, index) => {
          const isHighlighted = highlight?.has(index) ?? false;
          const isActive = activeIndex === index;
          const isWrong =
            showMistakes &&
            index !== 0 &&
            mark !== (reachable[index] ? 'check' : 'cross');
          const height =
            variant === 'stairs' ? 30 + index * 14 : undefined;

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <button
                type="button"
                data-cell-index={index}
                aria-label={labelFor(index, mark)}
                disabled={readOnly || isLocked(index)}
                onPointerDown={() => handlePointerDown(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setActiveIndex(index)}
                style={{
                  height: height ? `${height}px` : undefined,
                  touchAction: 'pan-y',
                }}
                className={cn(
                  'relative flex w-11 min-w-11 items-center justify-center rounded-lg border-2 transition-all duration-100',
                  variant === 'array' && 'h-11',
                  markStyles[mark],
                  isLocked(index) && 'cursor-default opacity-90',
                  !readOnly && !isLocked(index) && 'cursor-pointer hover:brightness-95',
                  isHighlighted && 'ring-2 ring-brand ring-offset-2',
                  isActive && !isHighlighted && 'ring-2 ring-brand/40',
                  isWrong && 'ring-2 ring-wrong ring-offset-2 animate-pop-in',
                )}
              >
                {mark === 'check' && <Check className="h-5 w-5" aria-hidden="true" />}
                {mark === 'cross' && <X className="h-5 w-5" aria-hidden="true" />}
              </button>
              <span
                className={cn(
                  'text-xs tabular-nums',
                  isActive ? 'font-semibold text-ink' : 'text-muted',
                )}
              >
                {index}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
