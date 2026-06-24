import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from 'react';
import { useReducedMotion } from 'framer-motion';
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
  /** Steps whose look-back arrows are always drawn (independent of hover). */
  arrowTargets?: number[];
  /** Play a hands-off looping reveal: each step's verdict (✓/✗) appears in
   *  sequence and the `arrowTargets`' look-back arrows draw themselves in as
   *  their target is reached, then it pauses and restarts. Overrides `marks`
   *  with the computed reachability map. */
  loop?: boolean;
}

const markStyles: Record<CellMark, string> = {
  empty: 'bg-surface border-line text-muted',
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
  arrowTargets,
  loop = false,
}: ReachabilityCellsProps) {
  const persistentTargets = arrowTargets ?? [];
  const arrowsEnabled = showArrows || persistentTargets.length > 0;
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Looping reveal: `cursor` walks from -1 (blank) up to `steps`, exposing one
  // step per tick; it then holds on the full picture before resetting to -1 and
  // replaying. Reduced-motion users just see the finished diagram, no loop.
  const [cursor, setCursor] = useState(loop && !reduceMotion ? -1 : steps);

  useEffect(() => {
    if (!loop) return;
    if (reduceMotion) {
      setCursor(steps);
      return;
    }
    const atEnd = cursor >= steps;
    const delay = atEnd ? 1600 : cursor < 0 ? 450 : 620;
    const id = window.setTimeout(
      () => setCursor((c) => (c >= steps ? -1 : c + 1)),
      delay,
    );
    return () => window.clearTimeout(id);
  }, [loop, reduceMotion, cursor, steps]);
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
    if (!arrowsEnabled) return;
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
  }, [arrowsEnabled, marks.length, variant, steps, jumpSizes]);

  const reachable = computeReachable(steps, jumpSizes);

  // In loop mode the timeline owns what's shown: verdicts appear up to `cursor`
  // and the rest stay blank until the reveal reaches them.
  const effectiveMarks: CellMark[] = loop
    ? marks.map((_, i) =>
        i <= cursor ? (reachable[i] ? 'check' : 'cross') : 'empty',
      )
    : marks;

  const persistent = highlightIndices ?? [];
  const active = activeIndex !== null ? lookbackIndices(activeIndex, jumpSizes) : [];
  const highlight = loop
    ? cursor >= 0
      ? new Set([cursor])
      : null
    : persistent.length || active.length
      ? new Set([...persistent, ...active])
      : null;
  const isLocked = (index: number) => index <= lockedUpTo;

  // Targets whose look-back arrows should be drawn. In loop mode only the
  // targets reached so far are shown (so arrows accrue in sequence); otherwise
  // the always-on set plus the hovered/focused cell when interactive.
  const arrowTargetSet = new Set<number>(
    loop ? persistentTargets.filter((t) => t <= cursor) : persistentTargets,
  );
  if (!loop && showArrows && activeIndex !== null) arrowTargetSet.add(activeIndex);

  const arrows =
    arrowsEnabled && geom
      ? [...arrowTargetSet].flatMap((t) =>
          lookbackIndices(t, jumpSizes)
            // Only draw arrows from steps you can actually stand on — a jump
            // from an unreachable step isn't a real way to land here.
            .filter((p) => reachable[p])
            .map((p, j) => ({
              from: geom.centers[p],
              to: geom.centers[t],
              key: `${p}-${t}`,
              // Stagger multiple arrows landing on the same step so they spawn
              // one after another rather than all at once.
              delay: loop ? j * 0.16 : 0,
            }))
            .filter(
              (a): a is { from: CellGeom; to: CellGeom; key: string; delay: number } =>
                !!a.from && !!a.to,
            ),
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
      className={cn(
        // overflow-x-auto makes the browser compute overflow-y as `auto` too, so
        // anything rising above the cells gets clipped. Reserve headroom up top
        // whenever look-back arrows are drawn (their arc peaks above the tallest
        // cell) so they aren't sliced off.
        'w-full overflow-x-auto pb-2',
        arrowsEnabled ? 'pt-10' : '',
      )}
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
        {arrowsEnabled && geom && arrows.length > 0 && (
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
            {arrows.map((a) => {
              const sx = a.from.x;
              const sy = a.from.topY;
              const ex = a.to.x;
              const ey = a.to.topY;
              const cx = (sx + ex) / 2;
              const cy = Math.min(sy, ey) - 26;
              return (
                <path
                  key={a.key}
                  pathLength={loop ? 1 : undefined}
                  d={`M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey - 4}`}
                  className={cn('fill-none stroke-brand', loop && 'draw-arrow')}
                  style={loop ? { animationDelay: `${a.delay}s` } : undefined}
                  strokeWidth={2}
                  strokeLinecap="round"
                  markerEnd="url(#rc-arrowhead)"
                />
              );
            })}
          </svg>
        )}
        {effectiveMarks.map((mark, index) => {
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
