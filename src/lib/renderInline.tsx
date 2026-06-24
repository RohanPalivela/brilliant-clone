import type { ReactNode } from 'react';

/**
 * Turn `backtick` spans into highlighted code chips so concrete facts (steps,
 * arithmetic) stand out from the surrounding sentence. `keyPrefix` keeps React
 * keys stable when the same text is rendered across multiple lines.
 */
export function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, i) => {
    if (part.length >= 2 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={`${keyPrefix}-${i}`}
          className="mx-0.5 rounded border border-code-border bg-code-bg px-1.5 py-0.5 align-middle font-mono text-[0.85em] text-code-text"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}
