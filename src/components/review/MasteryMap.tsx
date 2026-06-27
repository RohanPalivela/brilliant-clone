import type { MasteryLevel, SkillMastery } from '../../types/review';
import { cn } from '../../lib/cn';

const LEVEL_LABEL: Record<MasteryLevel, string> = {
  learning: 'Learning',
  familiar: 'Familiar',
  strong: 'Strong',
  mastered: 'Mastered',
};

const LEVEL_BADGE: Record<MasteryLevel, string> = {
  learning: 'bg-canvas text-muted',
  familiar: 'bg-brand-soft text-brand',
  strong: 'bg-flame/10 text-flame',
  mastered: 'bg-correct-soft text-correct',
};

const LEVEL_BAR: Record<MasteryLevel, string> = {
  learning: 'bg-muted',
  familiar: 'bg-brand',
  strong: 'bg-flame',
  mastered: 'bg-correct',
};

interface MasteryMapProps {
  mastery: SkillMastery[];
}

/**
 * Per-pattern mastery — the "mastery signal beyond completion" the lesson path
 * lacks. Strength reflects how far each pattern's spacing interval has grown,
 * so it decays toward review and only reaches "Mastered" through durable recall.
 */
export function MasteryMap({ mastery }: MasteryMapProps) {
  if (mastery.length === 0) {
    return (
      <p className="text-sm text-muted">
        Solve problems in a lesson to start building pattern mastery. Each one
        you get right is scheduled to come back here for review.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p
        className="text-xs text-muted"
        title="Mastered ≈ you can go ~3 weeks without review before a pattern fades."
      >
        Strength climbs with each successful recall — Learning → Familiar →
        Strong → Mastered — and decays as a pattern nears its next review.
      </p>
      <ul className="flex flex-col gap-3">
      {mastery.map((m) => {
        const pct = Math.round(m.strength * 100);
        // A sibling agent adds `practiced` (items with reps > 0) to SkillMastery
        // so freshly-seeded, never-attempted variants don't read as real
        // progress. Fall back to `total` so this compiles regardless of merge
        // order.
        const practiced = m.practiced ?? m.total;
        return (
          <li
            key={m.skill.id}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {m.skill.name}
                </p>
                <p className="mt-0.5 text-xs text-muted">{m.skill.blurb}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold',
                  LEVEL_BADGE[m.level],
                )}
              >
                {LEVEL_LABEL[m.level]}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-line"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${m.skill.name} mastery`}
              >
                <div
                  className={cn('h-full rounded-full transition-[width] duration-500', LEVEL_BAR[m.level])}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className="shrink-0 text-xs font-medium tabular-nums text-muted"
                title={`${practiced} of ${m.total} variant${m.total === 1 ? '' : 's'} practiced in this pattern`}
              >
                {m.due > 0
                  ? `${m.due} due`
                  : `${practiced} practiced / ${m.total} in pool`}
              </span>
            </div>
          </li>
        );
      })}
      </ul>
    </div>
  );
}
