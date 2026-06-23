import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
