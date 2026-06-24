import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { GreedyFailureProps } from '../../types/content';

interface Props {
  config: GreedyFailureProps;
}

// SVG geometry (user units). Two lanes of coins — greedy on top, optimal below —
// each ending in a count badge so the eye compares "how many coins" directly.
const COIN_R = 22;
const COIN_GAP = 14;
const COIN_STEP = COIN_R * 2 + COIN_GAP; // 58
const LANE_X = 96; // left edge where coins start (after the lane label)
const BADGE_W = 78;
const LANE_GAP = 96;
const TOP_PAD = 30;

const VAR = {
  flame: 'var(--color-flame)',
  correct: 'var(--color-correct)',
  wrong: 'var(--color-wrong)',
};

function laneCenters(count: number, cy: number) {
  return Array.from({ length: count }, (_, i) => ({
    cx: LANE_X + COIN_R + i * COIN_STEP,
    cy,
  }));
}

export function GreedyFailure({ config }: Props) {
  const reduce = useReducedMotion();
  const { greedyPick, optimalPick } = config;
  const total = greedyPick.length + optimalPick.length;

  // A single cursor reveals coins one at a time — first the whole greedy lane,
  // then the optimal lane — so the learner watches greedy overspend before the
  // shorter solution lands. Reduced motion jumps to the finished comparison.
  const [revealed, setRevealed] = useState(reduce ? total : 0);

  useEffect(() => {
    if (reduce) {
      setRevealed(total);
      return;
    }
    const atEnd = revealed >= total;
    let delay = 620;
    if (revealed === 0) delay = 500;
    else if (revealed === greedyPick.length) delay = 1100; // hold on the greedy total
    if (atEnd) delay = 2200; // hold on the side-by-side verdict, then loop
    const id = window.setTimeout(
      () => setRevealed((r) => (r >= total ? 0 : r + 1)),
      delay,
    );
    return () => window.clearTimeout(id);
  }, [reduce, revealed, total, greedyPick.length]);

  const greedyCY = TOP_PAD + COIN_R;
  const optimalCY = greedyCY + LANE_GAP;
  const greedyCoins = laneCenters(greedyPick.length, greedyCY);
  const optimalCoins = laneCenters(optimalPick.length, optimalCY);

  const maxCount = Math.max(greedyPick.length, optimalPick.length);
  const badgeX = LANE_X + maxCount * COIN_STEP + 18;
  const width = badgeX + BADGE_W + 12;
  const height = optimalCY + COIN_R + TOP_PAD;

  const greedyDone = revealed >= greedyPick.length;
  const optimalDone = revealed >= total;

  const renderLane = (
    coins: { cx: number; cy: number }[],
    values: number[],
    offset: number,
    color: string,
    label: string,
    cy: number,
    badgeShown: boolean,
  ) => (
    <g>
      <text
        x={12}
        y={cy + 4}
        className="text-[12px] font-bold uppercase tracking-wide"
        style={{ fill: color }}
      >
        {label}
      </text>

      {coins.map((c, i) => {
        const shown = revealed > offset + i;
        return (
          <motion.g
            key={i}
            initial={false}
            animate={{
              opacity: shown ? 1 : 0,
              scale: shown ? 1 : 0.4,
            }}
            transition={{ type: 'spring', stiffness: 520, damping: 24 }}
            style={{ transformOrigin: `${c.cx}px ${c.cy}px` }}
          >
            <circle
              cx={c.cx}
              cy={c.cy}
              r={COIN_R}
              className="fill-surface"
              stroke={color}
              strokeWidth={2.5}
            />
            <text
              x={c.cx}
              y={c.cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[15px] font-bold tabular-nums"
              style={{ fill: color }}
            >
              {values[i]}
            </text>
          </motion.g>
        );
      })}

      <motion.g
        initial={false}
        animate={{ opacity: badgeShown ? 1 : 0, x: badgeShown ? 0 : -8 }}
        transition={{ duration: reduce ? 0 : 0.35 }}
      >
        <rect
          x={badgeX}
          y={cy - 17}
          width={BADGE_W}
          height={34}
          rx={17}
          fill={color}
        />
        <text
          x={badgeX + BADGE_W / 2}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[13px] font-extrabold tabular-nums"
          fill="#fff"
        >
          {values.length} coin{values.length === 1 ? '' : 's'}
        </text>
      </motion.g>
    </g>
  );

  const ariaLabel = `Making ${config.amount} from coins ${config.coins.join(
    ', ',
  )}. Greedy grabs the biggest coins first and uses ${
    greedyPick.length
  } coins, while the best solution uses only ${optimalPick.length}.`;

  return (
    <div className="w-full select-none">
      <div className="mx-auto w-full max-w-[460px] overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto block h-auto w-full"
          role="img"
          aria-label={ariaLabel}
        >
          {renderLane(
            greedyCoins,
            greedyPick,
            0,
            VAR.flame,
            'Greedy',
            greedyCY,
            greedyDone,
          )}
          {renderLane(
            optimalCoins,
            optimalPick,
            greedyPick.length,
            VAR.correct,
            'Best',
            optimalCY,
            optimalDone,
          )}
        </svg>
      </div>

      <div className="mx-auto mt-5 flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-flame" />
          Grab the biggest coin
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-correct" />
          Fewest coins
        </span>
      </div>

      <motion.p
        initial={false}
        animate={{ opacity: optimalDone ? 1 : 0.35 }}
        transition={{ duration: reduce ? 0 : 0.4 }}
        className="mx-auto mt-3 max-w-md text-center text-sm font-semibold text-wrong"
      >
        Greedy spent {greedyPick.length} coins where {optimalPick.length} would
        do — grabbing the biggest coin first is not always optimal.
      </motion.p>

      {config.caption && (
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-ink-soft">
          {config.caption}
        </p>
      )}
    </div>
  );
}
