// Defense-in-depth helpers that keep the learner's text strictly *data*, never
// instructions, and keep the navigation control-channel out of the visible
// reply. None of these throw — when in doubt they return safe, inert values.

/** A short random token used to fence untrusted learner input per request. */
export function makeNonce(): string {
  try {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback if WebCrypto is unavailable; still unguessable enough to fence.
    return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  }
}

/**
 * The open/close markers wrapping untrusted learner text. The nonce is what
 * makes them un-forgeable: a learner can't close the block early (and "escape"
 * into instruction context) without guessing the random token.
 */
export function userDataDelimiters(nonce: string): { open: string; close: string } {
  return {
    open: `⟦USER_DATA:${nonce}⟧`,
    close: `⟦END_USER_DATA:${nonce}⟧`,
  };
}

/** Wrap a learner message so the model treats its contents as data, not orders. */
export function wrapUntrusted(content: string, nonce: string): string {
  const { open, close } = userDataDelimiters(nonce);
  // Strip any literal copies of our delimiter the learner may have typed, so
  // they can't fake a boundary even by luck.
  const stripped = content
    .split(open)
    .join('')
    .split(close)
    .join('');
  return `${open}\n${stripped}\n${close}`;
}

const NAV_FENCE = '```tutor-nav';

/**
 * Remove the navigation control block from text shown to the learner. Used
 * while streaming, before the final parse runs, so a half-formed directive (or
 * its payload) is never rendered in the chat.
 */
export function stripNavForDisplay(text: string): string {
  const idx = text.indexOf(NAV_FENCE);
  if (idx < 0) return text;
  return text.slice(0, idx).trimEnd();
}
