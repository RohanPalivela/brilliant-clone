import type { ReactNode } from 'react';

/** Split text on `backtick` spans, rendering each span as a code chip. */
function renderCodeTokens(text: string, keyPrefix: string): ReactNode[] {
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

/** Case-insensitive index of `needle` in `haystack`, or -1. */
function findPhrase(haystack: string, needle: string): number {
  return haystack.toLowerCase().indexOf(needle.toLowerCase());
}

/**
 * Turn `backtick` spans into highlighted code chips so concrete facts (steps,
 * arithmetic) stand out from the surrounding sentence. When `highlight` is a
 * phrase found in the text (the tutor spotlighting a useful part), that span is
 * wrapped in a spotlight `<mark>` — with code chips still rendered inside it.
 * `keyPrefix` keeps React keys stable across lines.
 */
export function renderInline(
  text: string,
  keyPrefix: string,
  highlight?: string,
): ReactNode[] {
  if (!highlight) return renderCodeTokens(text, keyPrefix);

  const idx = findPhrase(text, highlight);
  if (idx < 0) return renderCodeTokens(text, keyPrefix);

  const pre = text.slice(0, idx);
  const mid = text.slice(idx, idx + highlight.length);
  const post = text.slice(idx + highlight.length);

  return [
    ...renderCodeTokens(pre, `${keyPrefix}-pre`),
    <mark key={`${keyPrefix}-hl`} className="tutor-highlight">
      {renderCodeTokens(mid, `${keyPrefix}-hl-in`)}
    </mark>,
    ...renderCodeTokens(post, `${keyPrefix}-post`),
  ];
}

/**
 * Wrap an occurrence of `highlight` in a spotlight `<mark>` for plain text that
 * is *not* run through the backtick chip logic (e.g. RichText body/emphasis,
 * which render their backticks literally today). Returns the text unchanged
 * when there's nothing to highlight.
 */
export function highlightPlain(
  text: string,
  keyPrefix: string,
  highlight?: string,
): ReactNode {
  if (!highlight) return text;
  const idx = findPhrase(text, highlight);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark key={`${keyPrefix}-hl`} className="tutor-highlight">
        {text.slice(idx, idx + highlight.length)}
      </mark>
      {text.slice(idx + highlight.length)}
    </>
  );
}
