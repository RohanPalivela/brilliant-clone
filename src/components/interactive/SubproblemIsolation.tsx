import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { SubproblemIsolationProps } from '../../types/content';

interface Props {
  config: SubproblemIsolationProps;
}

// Diagram geometry (SVG user units). Five blocks in a row; two look-back arrows
// arc over the row into the rightmost "goal" block.
const BLOCK = 64;
const GAP = 18;
const STEP = BLOCK + GAP; // 82
const W = BLOCK * 5 + GAP * 4; // 392
const BLOCK_TOP = 124;
const BLOCK_BOTTOM = BLOCK_TOP + BLOCK; // 188
const cx = (i: number) => BLOCK / 2 + i * STEP; // center x of block i

type Kind = 'reachable' | 'unreachable' | 'irrelevant' | 'goal';

// Block 0 is a known-reachable subproblem, block 2 a known dead end, the goal is
// block 4. Blocks 1 and 3 are deliberately irrelevant: the goal only depends on
// the steps you could have jumped from, so the rest stay unknown (grey "?").
const BLOCKS: Kind[] = ['reachable', 'irrelevant', 'unreachable', 'irrelevant', 'goal'];
const GOAL = 4;

// Phase timeline (ms between steps). 0: setup → 1: valid arrow → 2: dead arrow →
// 3: goal resolves → loop.
const PHASE_DELAYS = [780, 820, 900, 1700];

const VAR = {
  correct: 'var(--color-correct)',
  correctSoft: 'var(--color-correct-soft)',
  wrong: 'var(--color-wrong)',
  wrongSoft: 'var(--color-wrong-soft)',
  brand: 'var(--color-brand)',
  brandSoft: 'var(--color-brand-soft)',
  line: 'var(--color-line)',
  surface: 'var(--color-surface)',
  canvas: 'var(--color-canvas)',
  muted: 'var(--color-muted)',
  ink: 'var(--color-ink)',
};

/** A ✓ drawn as an SVG polyline, centered on (x, y). */
function CheckGlyph({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <polyline
      points={`${x - 11},${y} ${x - 3},${y + 9} ${x + 12},${y - 11}`}
      fill="none"
      stroke={color}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** An ✗ drawn as two SVG lines, centered on (x, y). */
function CrossGlyph({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g stroke={color} strokeWidth={4} strokeLinecap="round">
      <line x1={x - 10} y1={y - 10} x2={x + 10} y2={y + 10} />
      <line x1={x - 10} y1={y + 10} x2={x + 10} y2={y - 10} />
    </g>
  );
}

export function SubproblemIsolation({ config }: Props) {
  const reduce = useReducedMotion();
  // With reduced motion we jump straight to the resolved state and never loop.
  const [phase, setPhase] = useState(reduce ? 3 : 0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (reduce) {
      setPhase(3);
      return;
    }
    setPhase(0);
    const timers: number[] = [];
    let elapsed = 0;
    // Schedule 0→1→2→3, then a final hold that restarts the loop.
    PHASE_DELAYS.forEach((delay, i) => {
      elapsed += delay;
      timers.push(
        window.setTimeout(() => {
          if (i < 3) setPhase(i + 1);
          else setRunId((r) => r + 1); // hold finished → loop
        }, elapsed),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [reduce, runId]);

  const validShown = phase >= 1;
  const deadShown = phase >= 2;
  const resolved = phase >= 3;

  // Green (valid) arc: block 0 → goal. Red (dead) arc: block 2 → goal. Both land
  // a little above the goal block so the arrowheads don't clip its top edge.
  const ARROW_END = BLOCK_TOP - 18; // 106
  const greenPath = `M ${cx(0)} ${BLOCK_TOP} C ${cx(0)} 22, ${cx(GOAL)} 22, ${cx(GOAL)} ${ARROW_END}`;
  const redPath = `M ${cx(2)} ${BLOCK_TOP} C ${cx(2)} 64, ${cx(GOAL)} 64, ${cx(GOAL)} ${ARROW_END}`;
  const drawT = { duration: reduce ? 0 : 0.55, ease: 'easeInOut' as const };

  return (
    <div className="w-full select-none">
      <div className="mx-auto w-full max-w-[440px] overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} 232`}
          className="mx-auto w-full"
          role="img"
          aria-label="Five steps in a row. The goal step is decided only by the two steps it could be reached from: one is reachable, drawing a valid green arrow, so the goal becomes reachable; the other is a dead end, drawing an invalid red arrow. The remaining steps don't matter."
        >
          <defs>
            <marker id="head-green" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
              <path d="M0,0 L9,4.5 L0,9 Z" fill={VAR.correct} />
            </marker>
            <marker id="head-red" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
              <path d="M0,0 L9,4.5 L0,9 Z" fill={VAR.wrong} />
            </marker>
          </defs>

          {/* GOAL marker below the rightmost block (kept clear of the look-back
              arrows that land on the block's top edge) */}
          <motion.g
            initial={false}
            animate={reduce ? {} : { y: [0, 3, 0] }}
            transition={reduce ? {} : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d={`M ${cx(GOAL)} 197 l -5 6 l 10 0 Z`}
              fill={resolved ? VAR.correct : VAR.brand}
            />
            <rect
              x={cx(GOAL) - 26}
              y={203}
              width={52}
              height={20}
              rx={10}
              fill={resolved ? VAR.correct : VAR.brand}
            />
            <text
              x={cx(GOAL)}
              y={217}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              letterSpacing="0.06em"
              fill="#fff"
            >
              GOAL
            </text>
          </motion.g>

          {/* Valid (green) look-back arrow */}
          <motion.path
            d={greenPath}
            fill="none"
            stroke={VAR.correct}
            strokeWidth={3}
            strokeLinecap="round"
            markerEnd="url(#head-green)"
            initial={false}
            animate={{ pathLength: validShown ? 1 : 0, opacity: validShown ? 1 : 0 }}
            transition={drawT}
          />
          {/* "valid" tag at the green arc's apex */}
          <motion.g
            initial={false}
            animate={{ opacity: validShown ? 1 : 0, scale: validShown ? 1 : 0.6 }}
            transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.35 }}
            style={{ transformOrigin: `${cx(2)}px 30px` }}
          >
            <rect x={cx(2) - 26} y={20} width={52} height={20} rx={10} fill={VAR.correctSoft} />
            <text x={cx(2)} y={34} textAnchor="middle" fontSize="11" fontWeight="800" fill={VAR.correct}>
              valid
            </text>
          </motion.g>

          {/* Dead (red) look-back arrow */}
          <motion.path
            d={redPath}
            fill="none"
            stroke={VAR.wrong}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="1 7"
            markerEnd="url(#head-red)"
            initial={false}
            animate={{ pathLength: deadShown ? 1 : 0, opacity: deadShown ? 1 : 0 }}
            transition={drawT}
          />
          {/* ✗ badge over the red arc, marking the dead path */}
          <motion.g
            initial={false}
            animate={{ opacity: deadShown ? 1 : 0, scale: deadShown ? 1 : 0.5 }}
            transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.3 }}
            style={{ transformOrigin: `${(cx(2) + cx(GOAL)) / 2}px 64px` }}
          >
            <circle cx={(cx(2) + cx(GOAL)) / 2} cy={64} r={12} fill={VAR.wrong} />
            <g stroke="#fff" strokeWidth={2.5} strokeLinecap="round">
              <line
                x1={(cx(2) + cx(GOAL)) / 2 - 5}
                y1={59}
                x2={(cx(2) + cx(GOAL)) / 2 + 5}
                y2={69}
              />
              <line
                x1={(cx(2) + cx(GOAL)) / 2 - 5}
                y1={69}
                x2={(cx(2) + cx(GOAL)) / 2 + 5}
                y2={59}
              />
            </g>
          </motion.g>

          {/* The five blocks */}
          {BLOCKS.map((kind, i) => {
            const x = cx(i) - BLOCK / 2;
            const center = cx(i);
            const midY = (BLOCK_TOP + BLOCK_BOTTOM) / 2;
            const isGoal = kind === 'goal';
            const goalResolved = isGoal && resolved;

            let fill = VAR.canvas;
            let stroke = VAR.line;
            if (kind === 'reachable') {
              fill = VAR.correctSoft;
              stroke = VAR.correct;
            } else if (kind === 'unreachable') {
              fill = VAR.wrongSoft;
              stroke = VAR.wrong;
            } else if (isGoal) {
              fill = goalResolved ? VAR.correctSoft : VAR.brandSoft;
              stroke = goalResolved ? VAR.correct : VAR.brand;
            }

            return (
              <g key={i}>
                {/* Pulsing focus ring around the goal until it resolves */}
                {isGoal && (
                  <motion.rect
                    x={x - 5}
                    y={BLOCK_TOP - 5}
                    width={BLOCK + 10}
                    height={BLOCK + 10}
                    rx={18}
                    fill="none"
                    stroke={goalResolved ? VAR.correct : VAR.brand}
                    strokeWidth={2.5}
                    initial={false}
                    animate={
                      reduce || goalResolved
                        ? { opacity: 0.9, scale: 1 }
                        : { opacity: [0.3, 0.9, 0.3], scale: [1, 1.04, 1] }
                    }
                    transition={
                      reduce || goalResolved
                        ? { duration: 0.3 }
                        : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                    }
                    style={{ transformOrigin: `${center}px ${midY}px` }}
                  />
                )}

                <motion.rect
                  x={x}
                  y={BLOCK_TOP}
                  width={BLOCK}
                  height={BLOCK}
                  rx={14}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={2.5}
                  initial={false}
                  animate={
                    goalResolved && !reduce
                      ? { scale: [1, 1.12, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.4 }}
                  style={{ transformOrigin: `${center}px ${midY}px` }}
                />

                {/* Glyph: ✓ / ✗ / ? (the goal flips ? → ✓ when it resolves) */}
                {kind === 'reachable' && (
                  <CheckGlyph x={center} y={midY} color={VAR.correct} />
                )}
                {kind === 'unreachable' && (
                  <CrossGlyph x={center} y={midY} color={VAR.wrong} />
                )}
                {kind === 'irrelevant' && (
                  <text
                    x={center}
                    y={midY + 9}
                    textAnchor="middle"
                    fontSize="26"
                    fontWeight="800"
                    fill={VAR.muted}
                  >
                    ?
                  </text>
                )}
                {isGoal && (
                  <>
                    <motion.text
                      x={center}
                      y={midY + 9}
                      textAnchor="middle"
                      fontSize="26"
                      fontWeight="800"
                      fill={VAR.brand}
                      initial={false}
                      animate={{ opacity: goalResolved ? 0 : 1 }}
                      transition={{ duration: reduce ? 0 : 0.2 }}
                    >
                      ?
                    </motion.text>
                    <motion.g
                      initial={false}
                      animate={{ opacity: goalResolved ? 1 : 0, scale: goalResolved ? 1 : 0.4 }}
                      transition={{ duration: reduce ? 0 : 0.3 }}
                      style={{ transformOrigin: `${center}px ${midY}px` }}
                    >
                      <CheckGlyph x={center} y={midY} color={VAR.correct} />
                    </motion.g>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mx-auto mt-5 flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-correct" />
          Valid jump in
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-wrong" />
          Dead end
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="grid h-4 w-4 place-items-center rounded-md border-2 border-line text-[10px] text-muted">
            ?
          </span>
          Doesn’t matter
        </span>
      </div>

      {config.caption && (
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-ink-soft">
          {config.caption}
        </p>
      )}
    </div>
  );
}
