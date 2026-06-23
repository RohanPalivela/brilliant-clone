import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from 'react';
import { Check, X } from 'lucide-react';
import type { CellMark, CellDisplay } from '../../types/content';
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
  /** Show 0/1 instead of ✓/✗ glyphs. */
  display?: CellDisplay;
  /** Draw dependency arrows from the active cell's look-backs (i−j) to it. */
  showArrows?: boolean;
}

const markStyles: Record<CellMark, string> = {
  empty: 'bg-white border-line text-muted',
  check: 'bg-correct-soft border-correct text-correct',
  cross: 'bg-wrong-soft border-wrong text-wrong',
};

interface CellGeom {
  x: number;
  topY: number;
}

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
  display = 'icon',
  showArrows = false,
}: ReachabilityCellsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const drag = useRef<{ active: boolean; mark: CellMark }>({
    active: false,
    mark: 'empty',
  });

  const innerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [geom, setGeom] = useState<{
    w: number;
    h: number;
    centers: (CellGeom | null)[];
  } | null>(null);

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

  // Measure cell positions (relative to the inner row) so we can draw arrows
  // from each look-back to the cell it decides. Positions are stable regardless
  // of which cell is active, so we only remeasure on layout/resize changes.
  useLayoutEffect(() => {
    if (!showArrows) return;
    const inner = innerRef.current;
    if (!inner) return;
    const measure = () => {
      const base = inner.getBoundingClientRect();
      const centers = btnRefs.current.map((b) => {
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return { x: r.left - base.left + r.width / 2, topY: r.top - base.top };
      });
      setGeom({ w: inner.scrollWidth, h: inner.clientHeight, centers });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [showArrows, marks.length, variant, steps, jumpSizes]);

  const reachable = computeReachable(steps, jumpSizes);
  const persistent = highlightIndices ?? [];
  const active = activeIndex !== null ? lookbackIndices(activeIndex, jumpSizes) : [];
  const highlight =
    persistent.length || active.length ? new Set([...persistent, ...active]) : null;
  const isLocked = (index: number) => index <= lockedUpTo;

  const arrows =
    showArrows && geom && activeIndex !== null
      ? lookbackIndices(activeIndex, jumpSizes)
          .map((p) => ({ from: geom.centers[p], to: geom.centers[activeIndex] }))
          .filter(
            (a): a is { from: CellGeom; to: CellGeom } => !!a.from && !!a.to,
          )
      : [];

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
        ref={innerRef}
        className={cn(
          'relative mx-auto flex w-max gap-1.5 px-1',
          variant === 'stairs' ? 'items-end' : 'items-center',
        )}
      >
        {showArrows && geom && arrows.length > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 z-10 overflow-visible"
            width={geom.w}
            height={geom.h}
            aria-hidden="true"
          >
            <defs>
              <marker
                id="rc-arrowhead"
                markerWidth="7"
                markerHeight="7"
                refX="5"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" className="fill-brand" />
              </marker>
            </defs>
            {arrows.map((a, i) => {
              const sx = a.from.x;
              const sy = a.from.topY;
              const ex = a.to.x;
              const ey = a.to.topY;
              const cx = (sx + ex) / 2;
              const cy = Math.min(sy, ey) - 26;
              return (
                <path
                  key={i}
                  d={`M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey - 4}`}
                  className="fill-none stroke-brand"
                  strokeWidth={2}
                  strokeLinecap="round"
                  markerEnd="url(#rc-arrowhead)"
                />
              );
            })}
          </svg>
        )}
        {marks.map((mark, index) => {
          const isHighlighted = highlight?.has(index) ?? false;
          const isActive = activeIndex === index;
          const isWrong =
            showMistakes &&
            index !== 0 &&
            mark !== (reachable[index] ? 'check' : 'cross');
          const height =
            variant === 'stairs' ? 30 + index * 14 : undefined;
          const binaryGlyph =
            mark === 'check' ? '1' : mark === 'cross' ? '0' : '';

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <button
                type="button"
                ref={(el) => {
                  btnRefs.current[index] = el;
                }}
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
                {display === 'binary' ? (
                  <span className="text-base font-bold tabular-nums">
                    {binaryGlyph}
                  </span>
                ) : (
                  <>
                    {mark === 'check' && <Check className="h-5 w-5" aria-hidden="true" />}
                    {mark === 'cross' && <X className="h-5 w-5" aria-hidden="true" />}
                  </>
                )}
              </button>
              <span
                className={cn(
                  'text-xs tabular-nums',
                  isActive ? 'font-semibold text-ink' : 'text-muted',
                )}
              >
                {variant === 'array' ? `[${index}]` : index}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
