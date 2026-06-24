import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { CoinRecurrenceProps } from '../../types/content';

interface Props {
  config: CoinRecurrenceProps;
}

// Diagram geometry (SVG user units). Two known subproblems on the left feed the
// goal Z on the right; each arrow is "take one coin", so Z costs 1 + the better
// of the two.
const NODE_W = 120;
const NODE_H = 64;
const SUB_X = 22;
const SUB_TOP_Y = 18;
const SUB_BOT_Y = 132;
const GOAL_X = 286;
const GOAL_Y = 79;
const W = GOAL_X + NODE_W + 22;
const H = SUB_BOT_Y + NODE_H + 22;

// Phase timeline (ms): 0 setup → 1 mark the smaller subproblem → 2 add one coin
// along the winning arrow → 3 Z resolves → loop.
const PHASE_DELAYS = [900, 950, 1000, 1900];

const VAR = {
  correct: 'var(--color-correct)',
  correctSoft: 'var(--color-correct-soft)',
  brand: 'var(--color-brand)',
  brandSoft: 'var(--color-brand-soft)',
  line: 'var(--color-line)',
  canvas: 'var(--color-canvas)',
  muted: 'var(--color-muted)',
  ink: 'var(--color-ink)',
};

function midRight(y: number) {
  return { x: SUB_X + NODE_W, y: y + NODE_H / 2 };
}
const GOAL_LEFT = { x: GOAL_X, y: GOAL_Y + NODE_H / 2 };

export function CoinRecurrence({ config }: Props) {
  const { coinXLabel = 'X', coinYLabel = 'Y', costX = 5, costY = 4 } = config;
  const reduce = useReducedMotion();

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
    PHASE_DELAYS.forEach((delay, i) => {
      elapsed += delay;
      timers.push(
        window.setTimeout(() => {
          if (i < 3) setPhase(i + 1);
          else setRunId((r) => r + 1);
        }, elapsed),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [reduce, runId]);

  // The cheaper subproblem wins (ties go to Y, the lower row, arbitrarily).
  const winnerIsY = costY <= costX;
  const minCost = Math.min(costX, costY);
  const result = 1 + minCost;

  const marked = phase >= 1;
  const coinAdded = phase >= 2;
  const resolved = phase >= 3;

  // Curve from a subproblem's right edge into the goal's left edge.
  const arc = (from: { x: number; y: number }) => {
    const mx = (from.x + GOAL_LEFT.x) / 2;
    return `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${GOAL_LEFT.y}, ${
      GOAL_LEFT.x - 6
    } ${GOAL_LEFT.y}`;
  };

  const topArc = arc(midRight(SUB_TOP_Y));
  const botArc = arc(midRight(SUB_BOT_Y));
  const winArc = winnerIsY ? botArc : topArc;
  const loseArc = winnerIsY ? topArc : botArc;
  const drawT = { duration: reduce ? 0 : 0.55, ease: 'easeInOut' as const };

  const SubNode = ({
    y,
    coinLabel,
    cost,
    isWinner,
  }: {
    y: number;
    coinLabel: string;
    cost: number;
    isWinner: boolean;
  }) => {
    const highlight = marked && isWinner;
    const dim = marked && !isWinner;
    return (
      <g>
        {highlight && (
          <motion.rect
            x={SUB_X - 5}
            y={y - 5}
            width={NODE_W + 10}
            height={NODE_H + 10}
            rx={16}
            fill="none"
            stroke={VAR.correct}
            strokeWidth={2.5}
            initial={false}
            animate={
              reduce
                ? { opacity: 0.9 }
                : { opacity: [0.4, 0.9, 0.4], scale: [1, 1.03, 1] }
            }
            transition={
              reduce
                ? { duration: 0.3 }
                : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ transformOrigin: `${SUB_X + NODE_W / 2}px ${y + NODE_H / 2}px` }}
          />
        )}
        <motion.rect
          x={SUB_X}
          y={y}
          width={NODE_W}
          height={NODE_H}
          rx={12}
          fill={highlight ? VAR.correctSoft : VAR.canvas}
          stroke={highlight ? VAR.correct : VAR.line}
          strokeWidth={2.5}
          initial={false}
          animate={{ opacity: dim ? 0.45 : 1 }}
          transition={{ duration: reduce ? 0 : 0.4 }}
        />
        <text
          x={SUB_X + NODE_W / 2}
          y={y + 23}
          textAnchor="middle"
          className="text-[13px] font-bold"
          style={{ fill: highlight ? VAR.correct : VAR.ink }}
        >
          Z − {coinLabel}
        </text>
        <text
          x={SUB_X + NODE_W / 2}
          y={y + 46}
          textAnchor="middle"
          className="text-[16px] font-extrabold tabular-nums"
          style={{ fill: highlight ? VAR.correct : VAR.muted }}
        >
          {cost} coin{cost === 1 ? '' : 's'}
        </text>
      </g>
    );
  };

  const winLabelPos = {
    x: (midRight(winnerIsY ? SUB_BOT_Y : SUB_TOP_Y).x + GOAL_LEFT.x) / 2,
    y: (midRight(winnerIsY ? SUB_BOT_Y : SUB_TOP_Y).y + GOAL_LEFT.y) / 2,
  };

  return (
    <div className="w-full select-none">
      <div className="mx-auto w-full max-w-[460px] overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mx-auto block h-auto w-full"
          role="img"
          aria-label={`The fewest coins for Z is one coin plus the better of two known subproblems: Z minus ${coinXLabel} needs ${costX} coins and Z minus ${coinYLabel} needs ${costY} coins. Take the smaller, ${minCost}, add one coin, so Z needs ${result} coins.`}
        >
          <defs>
            <marker
              id="cr-head-win"
              markerWidth="9"
              markerHeight="9"
              refX="6"
              refY="4.5"
              orient="auto"
            >
              <path d="M0,0 L9,4.5 L0,9 Z" fill={VAR.correct} />
            </marker>
            <marker
              id="cr-head-dim"
              markerWidth="9"
              markerHeight="9"
              refX="6"
              refY="4.5"
              orient="auto"
            >
              <path d="M0,0 L9,4.5 L0,9 Z" fill={VAR.line} />
            </marker>
          </defs>

          {/* Losing option fades back once the minimum is chosen. */}
          <motion.path
            d={loseArc}
            fill="none"
            stroke={VAR.line}
            strokeWidth={2.5}
            strokeLinecap="round"
            markerEnd="url(#cr-head-dim)"
            initial={false}
            animate={{ opacity: marked ? 0.4 : 1 }}
            transition={drawT}
          />

          {/* Winning option: the path the +1 coin travels. */}
          <motion.path
            d={winArc}
            fill="none"
            stroke={coinAdded ? VAR.correct : VAR.line}
            strokeWidth={3}
            strokeLinecap="round"
            markerEnd={coinAdded ? 'url(#cr-head-win)' : 'url(#cr-head-dim)'}
            initial={false}
            animate={{ opacity: 1 }}
            transition={drawT}
          />

          {/* "+1 coin" tag riding the winning arrow. */}
          <motion.g
            initial={false}
            animate={{
              opacity: coinAdded ? 1 : 0,
              scale: coinAdded ? 1 : 0.6,
            }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            style={{ transformOrigin: `${winLabelPos.x}px ${winLabelPos.y}px` }}
          >
            <rect
              x={winLabelPos.x - 40}
              y={winLabelPos.y - 13}
              width={80}
              height={26}
              rx={13}
              fill={VAR.correct}
            />
            <text
              x={winLabelPos.x}
              y={winLabelPos.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] font-extrabold"
              fill="#fff"
            >
              + 1 {winnerIsY ? coinYLabel : coinXLabel} coin
            </text>
          </motion.g>

          <SubNode
            y={SUB_TOP_Y}
            coinLabel={coinXLabel}
            cost={costX}
            isWinner={!winnerIsY}
          />
          <SubNode
            y={SUB_BOT_Y}
            coinLabel={coinYLabel}
            cost={costY}
            isWinner={winnerIsY}
          />

          {/* Goal node Z — flips from "?" to the resolved coin count. */}
          <g>
            {!resolved && (
              <motion.rect
                x={GOAL_X - 5}
                y={GOAL_Y - 5}
                width={NODE_W + 10}
                height={NODE_H + 10}
                rx={16}
                fill="none"
                stroke={VAR.brand}
                strokeWidth={2.5}
                initial={false}
                animate={
                  reduce
                    ? { opacity: 0.8 }
                    : { opacity: [0.3, 0.85, 0.3], scale: [1, 1.04, 1] }
                }
                transition={
                  reduce
                    ? { duration: 0.3 }
                    : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                }
                style={{
                  transformOrigin: `${GOAL_X + NODE_W / 2}px ${GOAL_Y + NODE_H / 2}px`,
                }}
              />
            )}
            <motion.rect
              x={GOAL_X}
              y={GOAL_Y}
              width={NODE_W}
              height={NODE_H}
              rx={12}
              fill={resolved ? VAR.correctSoft : VAR.brandSoft}
              stroke={resolved ? VAR.correct : VAR.brand}
              strokeWidth={2.5}
              initial={false}
              animate={
                resolved && !reduce ? { scale: [1, 1.1, 1] } : { scale: 1 }
              }
              transition={{ duration: 0.4 }}
              style={{
                transformOrigin: `${GOAL_X + NODE_W / 2}px ${GOAL_Y + NODE_H / 2}px`,
              }}
            />
            <text
              x={GOAL_X + NODE_W / 2}
              y={GOAL_Y + 23}
              textAnchor="middle"
              className="text-[13px] font-bold"
              style={{ fill: resolved ? VAR.correct : VAR.brand }}
            >
              Z
            </text>
            {resolved ? (
              <text
                x={GOAL_X + NODE_W / 2}
                y={GOAL_Y + 46}
                textAnchor="middle"
                className="text-[16px] font-extrabold tabular-nums"
                style={{ fill: VAR.correct }}
              >
                {result} coins
              </text>
            ) : (
              <text
                x={GOAL_X + NODE_W / 2}
                y={GOAL_Y + 47}
                textAnchor="middle"
                className="text-[20px] font-extrabold"
                style={{ fill: VAR.brand }}
              >
                ?
              </text>
            )}
          </g>
        </svg>
      </div>

      {/* The recurrence written out; the result fills in when Z resolves. */}
      <div className="mx-auto mt-4 max-w-md text-center font-mono text-sm text-ink-soft">
        minCoins(Z) = 1 + min({costX}, {costY}) ={' '}
        <motion.span
          initial={false}
          animate={{ opacity: resolved ? 1 : 0.3 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          className="font-bold text-correct"
        >
          {resolved ? result : '?'}
        </motion.span>
      </div>

      {config.caption && (
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-ink-soft">
          {config.caption}
        </p>
      )}
    </div>
  );
}
