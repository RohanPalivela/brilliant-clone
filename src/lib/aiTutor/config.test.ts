import { describe, it, expect, afterEach, vi } from 'vitest';
import { getTutorConfig, isTutorConfigured } from './config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getTutorConfig', () => {
  it('falls back to the bundled proxy endpoint and default model', () => {
    vi.stubEnv('VITE_AI_TUTOR_ENABLED', 'true');
    vi.stubEnv('VITE_AI_TUTOR_ENDPOINT', '');
    vi.stubEnv('VITE_AI_TUTOR_MODEL', '');
    const cfg = getTutorConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.endpoint).toBe('/api/tutor');
    expect(cfg.model).toBe('gpt-4o-mini');
  });

  it('strips a trailing slash from a custom endpoint', () => {
    vi.stubEnv('VITE_AI_TUTOR_ENDPOINT', 'https://proxy.example.com/tutor/');
    expect(getTutorConfig().endpoint).toBe('https://proxy.example.com/tutor');
  });
});

describe('isTutorConfigured', () => {
  it('is false unless the feature flag is explicitly enabled (rest of app still works)', () => {
    vi.stubEnv('VITE_AI_TUTOR_ENABLED', '');
    expect(isTutorConfigured()).toBe(false);
  });

  it('is true when the flag is set to "true"', () => {
    vi.stubEnv('VITE_AI_TUTOR_ENABLED', 'true');
    expect(isTutorConfigured()).toBe(true);
  });

  it('treats any non-"true" value as disabled', () => {
    vi.stubEnv('VITE_AI_TUTOR_ENABLED', '1');
    expect(isTutorConfigured()).toBe(false);
  });
});
