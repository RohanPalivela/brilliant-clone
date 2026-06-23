import { cn } from '../../lib/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  /** Render as discrete segments instead of a continuous bar. */
  segments?: number;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
  segments,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  if (segments && segments > 0) {
    const filled = Math.round((pct / 100) * segments);
    return (
      <div
        className={cn('flex gap-1.5', className)}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              i < filled ? 'bg-brand' : 'bg-line',
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
