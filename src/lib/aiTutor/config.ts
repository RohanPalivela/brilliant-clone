import type { TutorConfig } from './types';

const DEFAULT_ENDPOINT = '/api/tutor';
const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Resolve the tutor config from Vite env. The browser no longer holds the model
 * API key — that lives server-side in the `/api/tutor` proxy. The client only
 * needs to know whether the feature is switched on, where the proxy lives, and
 * which model to request (a non-secret that shapes the request body). Reading
 * env lazily (not at module top-level) keeps this trivially testable by stubbing
 * `import.meta.env`.
 */
export function getTutorConfig(): TutorConfig {
  const env = import.meta.env;
  return {
    enabled: env.VITE_AI_TUTOR_ENABLED === 'true',
    endpoint: (env.VITE_AI_TUTOR_ENDPOINT || DEFAULT_ENDPOINT).replace(/\/+$/, ''),
    model: env.VITE_AI_TUTOR_MODEL || DEFAULT_MODEL,
  };
}

/**
 * The tutor is "configured" when the build flag is on. The client can't know if
 * the server proxy actually holds a key, so everywhere else in the app must keep
 * working when this is false — the widget renders a friendly disabled state
 * instead of attempting network calls.
 */
export function isTutorConfigured(): boolean {
  return getTutorConfig().enabled;
}
