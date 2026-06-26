import type { TutorConfig } from './types';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Resolve the tutor config from Vite env. The base URL and model fall back to
 * sensible OpenAI defaults; only the API key is required to be "configured".
 * Reading env lazily (not at module top-level) keeps this trivially testable
 * by stubbing `import.meta.env`.
 */
export function getTutorConfig(): TutorConfig {
  const env = import.meta.env;
  return {
    apiKey: (env.VITE_AI_TUTOR_API_KEY ?? '').trim(),
    baseUrl: (env.VITE_AI_TUTOR_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    model: env.VITE_AI_TUTOR_MODEL || DEFAULT_MODEL,
  };
}

/**
 * The tutor is "configured" only when an API key is present. Everywhere else in
 * the app must keep working when this is false — the widget renders a friendly
 * disabled state instead of attempting network calls.
 */
export function isTutorConfigured(): boolean {
  return getTutorConfig().apiKey.length > 0;
}
