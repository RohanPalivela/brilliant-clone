import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface FibonacciSequenceProps {
  /** How many terms to build, including the two seeds. Defaults to 7. */
  count?: number;
  /** The first two terms the sequence starts from. Defaults to [0, 1]. */
  seeds?: [number, number];
  /** Letter used for each cell's sub-label, e.g. 'F' → F(0), F(1)… */
  label?: string;
  /** Index shown for the first cell's sub-label (default 0). */
  startIndex?: number;
  /** Caption shown beneath the figure. */
  caption?: string;
  /** Overrides the default screen-reader description. */
  ariaLabel?: string;
}

// Cell + arc geometry (SVG user units).
const CELL_W = 52;
const CELL_H = 52;
const GAP = 28;
const STEP = CELL_W + GAP;
const PAD_X = 18;
const CELL_Y = 70;

const centerX = (i: number) => PAD_X + CELL_W / 2 + i * STEP;

function buildSequence(count: number, seeds: [number, number]) {
  const seq = [seeds[0], seeds[1]];
  for (let i = 2; i < count; i++) seq.push(seq[i - 1] + seq[i - 2]);
  return seq.slice(0, count);
}

// Arc from one cell's top edge up and over into another cell's top edge. `lift`
// sets how high the arc bows so the i−1 and i−2 arrows don't overlap.
function arcPath(srcX: number, dstX: number, lift: number) {
  const apexY = CELL_Y - lift;
  return `M ${srcX} ${CELL_Y} C ${srcX} ${apexY}, ${dstX} ${apexY}, ${dstX} ${CELL_Y - 6}`;
}

export function FibonacciSequence({
  count = 7,
  seeds = [0, 1],
  label = 'F',
  startIndex = 0,
  caption,
  ariaLabel,
}: FibonacciSequenceProps) {
  const reduce = useReducedMotion();
  const seq = buildSequence(count, seeds);

  // `revealed` is how many cells are on screen (starts at the two seeds and
  // grows one term at a time). The most recent cell is the one "being built".
  const [revealed, setRevealed] = useState(reduce ? count : 2);

  useEffect(() => {
    if (reduce) {
      setRevealed(count);
      return;
    }
    const done = revealed >= count;
    const delay = done ? 1900 : revealed === 2 ? 900 : 780;
    const id = window.setTimeout(
      () => setRevealed((r) => (r >= count ? 2 : r + 1)),
      delay,
    );
    return () => window.clearTimeout(id);
  }, [reduce, revealed, count]);

  const current = revealed - 1;
  const showArrows = current >= 2;
  const width = PAD_X * 2 + CELL_W + (count - 1) * STEP;
  const height = CELL_Y + CELL_H + 30;

  const defaultAria = `A ${label} sequence built left to right. The first two cells are starting values; every later cell is filled in as the sum of the two cells before it, with arrows drawn from those two predecessors.`;

  return (
    <figure className="mx-auto w-full max-w-lg">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel ?? defaultAria}
          className="mx-auto block h-auto max-w-full"
        >
          <defs>
            <marker
              id="fib-arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="5"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L7,4 L0,8 Z" className="fill-brand" />
            </marker>
          </defs>

          {/* The two look-back arrows feeding the cell currently being built. */}
          {showArrows && (
            <g key={current}>
              {[current - 1, current - 2].map((src, k) => (
                <motion.path
                  key={src}
                  d={arcPath(centerX(src), centerX(current), k === 0 ? 30 : 54)}
                  className="fill-none stroke-brand"
                  strokeWidth={2}
                  strokeLinecap="round"
                  markerEnd="url(#fib-arrowhead)"
                  initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: reduce ? 0 : 0.45, ease: 'easeInOut' }}
                />
              ))}
              {/* The "+" reminder that this cell is the sum of the two before it. */}
              <motion.text
                x={(centerX(current - 2) + centerX(current)) / 2}
                y={CELL_Y - 58}
                textAnchor="middle"
                className="fill-brand text-[12px] font-bold tabular-nums"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.3 }}
              >
                {seq[current - 2]} + {seq[current - 1]}
              </motion.text>
            </g>
          )}

          {seq.slice(0, revealed).map((value, i) => {
            const x = centerX(i) - CELL_W / 2;
            const isSeed = i < 2;
            const isCurrent = i === current && showArrows;
            return (
              <g
                key={i}
                className={cn(!reduce && i === current && 'animate-pop-in')}
                style={{ transformOrigin: `${centerX(i)}px ${CELL_Y + CELL_H / 2}px` }}
              >
                <rect
                  x={x}
                  y={CELL_Y}
                  width={CELL_W}
                  height={CELL_H}
                  rx={12}
                  className={cn(
                    isSeed
                      ? 'fill-brand-soft stroke-brand'
                      : isCurrent
                        ? 'fill-surface stroke-brand'
                        : 'fill-surface stroke-line',
                  )}
                  strokeWidth={isSeed || isCurrent ? 2.5 : 1.5}
                />
                <text
                  x={centerX(i)}
                  y={CELL_Y + CELL_H / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    'text-[18px] font-bold tabular-nums',
                    isSeed ? 'fill-brand' : 'fill-ink',
                  )}
                >
                  {value}
                </text>
                <text
                  x={centerX(i)}
                  y={CELL_Y + CELL_H + 16}
                  textAnchor="middle"
                  className="fill-muted text-[11px] font-semibold"
                >
                  {label}({startIndex + i})
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
