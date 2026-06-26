import type { Slide } from '../../types/content';

/** A short, single-line label drawn from whatever headline text a slide has. */
export function slideLabel(slide: Slide): string {
  const p = slide.props as Record<string, unknown>;
  const candidate =
    (typeof p.question === 'string' && p.question) ||
    (typeof p.heading === 'string' && p.heading) ||
    (typeof p.prompt === 'string' && p.prompt) ||
    (typeof p.body === 'string' && p.body) ||
    '';
  return candidate.replace(/\s+/g, ' ').trim().slice(0, 120);
}

/**
 * Every piece of human-readable text a slide renders, concatenated. This is the
 * truth source a tutor "highlight" must come from: a proposed spotlight phrase
 * is only honored when it appears verbatim here, so the model can never invent
 * text to highlight.
 */
export function slideFullText(slide: Slide): string {
  const parts: string[] = [];
  const walk = (value: unknown): void => {
    if (typeof value === 'string') {
      parts.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === 'object') {
      Object.values(value as Record<string, unknown>).forEach(walk);
    }
  };
  walk(slide.props);
  return parts.join('\n');
}

/** True when `phrase` appears verbatim (case-insensitive) in the slide's text. */
export function slideContainsPhrase(slide: Slide, phrase: string): boolean {
  const needle = phrase.trim().toLowerCase();
  if (!needle) return false;
  return slideFullText(slide).toLowerCase().includes(needle);
}
