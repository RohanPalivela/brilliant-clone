import { cn } from '../../lib/cn';

/**
 * Brand mark for DPrilliant.
 *
 * The glyph is drawn from the subject's own world rather than a generic icon:
 * three memo cells stepping up like a staircase — the canonical "climbing
 * stairs" intro problem and a dynamic-programming table filling in, bottom-up.
 * The cells share corners so the shape reads clearly as stairs at any size.
 */
export function StairGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="14" width="7.5" height="7.5" rx="1.8" />
      <rect x="8.25" y="8.25" width="7.5" height="7.5" rx="1.8" />
      <rect x="14" y="2.5" width="7.5" height="7.5" rx="1.8" opacity="0.85" />
    </svg>
  );
}

/** The mark inside its rounded badge. `size` controls the badge dimensions. */
export function LogoBadge({
  className,
  size = 'sm',
}: {
  className?: string;
  size?: 'sm' | 'lg';
}) {
  return (
    <span
      className={cn(
        'flex items-center justify-center bg-cta text-white',
        size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-12 w-12 rounded-xl',
        className,
      )}
    >
      <StairGlyph className={size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'} />
    </span>
  );
}

/** Badge + wordmark used in the top navigation. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 font-bold', className)}>
      <LogoBadge />
      <span className="hidden text-ink sm:inline">
        <span className="text-brand">DP</span>rilliant
      </span>
    </span>
  );
}
