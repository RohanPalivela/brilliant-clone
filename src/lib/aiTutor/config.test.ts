import { describe, it, expect, afterEach, vi } from 'vitest';
import { getTutorConfig, isTutorConfigured } from './config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getTutorConfig', () => {
  it('falls back to OpenAI defaults when only a key is set', () => {
    vi.stubEnv('VITE_AI_TUTOR_API_KEY', 'sk-test');
    vi.stubEnv('VITE_AI_TUTOR_BASE_URL', '');
    vi.stubEnv('VITE_AI_TUTOR_MODEL', '');
    const cfg = getTutorConfig();
    expect(cfg.apiKey).toBe('sk-test');
    expect(cfg.baseUrl).toBe('https://api.openai.com/v1');
    expect(cfg.model).toBe('gpt-4o-mini');
  });

  it('strips a trailing slash from the base url', () => {
    vi.stubEnv('VITE_AI_TUTOR_API_KEY', 'sk-test');
    vi.stubEnv('VITE_AI_TUTOR_BASE_URL', 'https://proxy.example.com/v1/');
    expect(getTutorConfig().baseUrl).toBe('https://proxy.example.com/v1');
  });
});

describe('isTutorConfigured', () => {
  it('is false without a key (the rest of the app must still work)', () => {
    vi.stubEnv('VITE_AI_TUTOR_API_KEY', '');
    expect(isTutorConfigured()).toBe(false);
  });

  it('is true once a key is present', () => {
    vi.stubEnv('VITE_AI_TUTOR_API_KEY', 'sk-live');
    expect(isTutorConfigured()).toBe(true);
  });

  it('treats whitespace-only keys as unconfigured', () => {
    vi.stubEnv('VITE_AI_TUTOR_API_KEY', '   ');
    expect(isTutorConfigured()).toBe(false);
  });
});
