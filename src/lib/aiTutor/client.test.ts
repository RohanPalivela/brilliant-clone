import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import {
  buildRequestBody,
  extractDelta,
  isReasoningModel,
  streamTutorReply,
  TutorError,
} from './client';

const encoder = new TextEncoder();

/** A fake fetch Response that streams the given SSE chunks via getReader(). */
function streamResponse(chunks: string[], init: { ok?: boolean; status?: number } = {}) {
  let i = 0;
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    body: {
      getReader() {
        return {
          read() {
            if (i < chunks.length) {
              return Promise.resolve({ done: false, value: encoder.encode(chunks[i++]) });
            }
            return Promise.resolve({ done: true, value: undefined });
          },
        };
      },
    },
  };
}

beforeEach(() => {
  vi.stubEnv('VITE_AI_TUTOR_API_KEY', 'sk-test');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('extractDelta', () => {
  it('pulls streamed delta content', () => {
    expect(extractDelta('{"choices":[{"delta":{"content":"hi"}}]}')).toBe('hi');
  });
  it('falls back to a non-streamed message', () => {
    expect(extractDelta('{"choices":[{"message":{"content":"yo"}}]}')).toBe('yo');
  });
  it('returns empty string on malformed json', () => {
    expect(extractDelta('not json')).toBe('');
  });
});

describe('isReasoningModel', () => {
  it('detects GPT-5 and o-series models', () => {
    expect(isReasoningModel('gpt-5.4-mini')).toBe(true);
    expect(isReasoningModel('gpt-5.5')).toBe(true);
    expect(isReasoningModel('o3')).toBe(true);
    expect(isReasoningModel('GPT-5.4')).toBe(true);
  });
  it('treats classic chat models as non-reasoning', () => {
    expect(isReasoningModel('gpt-4o-mini')).toBe(false);
    expect(isReasoningModel('gpt-4o')).toBe(false);
  });
});

describe('buildRequestBody', () => {
  it('uses reasoning_effort and omits temperature for reasoning models', () => {
    const body = buildRequestBody('gpt-5.4-mini', [{ role: 'user', content: 'hi' }]);
    expect(body.reasoning_effort).toBe('low');
    expect(body).not.toHaveProperty('temperature');
    expect(body.stream).toBe(true);
  });
  it('keeps a low temperature and no reasoning_effort for classic models', () => {
    const body = buildRequestBody('gpt-4o-mini', [{ role: 'user', content: 'hi' }]);
    expect(body.temperature).toBe(0.3);
    expect(body).not.toHaveProperty('reasoning_effort');
  });
});

describe('streamTutorReply', () => {
  it('sends reasoning_effort (and no temperature) when configured with a GPT-5 model', async () => {
    vi.stubEnv('VITE_AI_TUTOR_MODEL', 'gpt-5.4-mini');
    const fetchMock = vi.fn().mockResolvedValue(streamResponse(['data: [DONE]\n']));
    vi.stubGlobal('fetch', fetchMock);

    await streamTutorReply([{ role: 'user', content: 'hi' }]);

    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(sentBody.model).toBe('gpt-5.4-mini');
    expect(sentBody.reasoning_effort).toBe('low');
    expect(sentBody).not.toHaveProperty('temperature');
  });

  it('throws a TutorError when no API key is configured', async () => {
    vi.stubEnv('VITE_AI_TUTOR_API_KEY', '');
    await expect(streamTutorReply([{ role: 'user', content: 'hi' }])).rejects.toBeInstanceOf(
      TutorError,
    );
  });

  it('streams SSE deltas, reassembling content split across chunks', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      streamResponse([
        'data: {"choices":[{"delta":{"content":"Hel',
        'lo"}}]}\n\ndata: {"choices":[{"delta":{"content":" world"}}]}\n\n',
        'data: [DONE]\n',
      ]),
    );
    vi.stubGlobal('fetch', fetchMock);

    const tokens: string[] = [];
    const full = await streamTutorReply([{ role: 'user', content: 'hi' }], {
      onToken: (d) => tokens.push(d),
    });

    expect(full).toBe('Hello world');
    expect(tokens).toEqual(['Hello', ' world']);
  });

  it('throws a TutorError on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(streamResponse([], { ok: false, status: 500 })));
    await expect(
      streamTutorReply([{ role: 'user', content: 'hi' }]),
    ).rejects.toThrow(/500/);
  });

  it('falls back to JSON when there is no stream body', async () => {
    const res = {
      ok: true,
      status: 200,
      body: null,
      json: () =>
        Promise.resolve({ choices: [{ message: { content: 'full reply' } }] }),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res));
    const full = await streamTutorReply([{ role: 'user', content: 'hi' }]);
    expect(full).toBe('full reply');
  });

  it('wraps a network failure in a TutorError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')));
    await expect(
      streamTutorReply([{ role: 'user', content: 'hi' }]),
    ).rejects.toBeInstanceOf(TutorError);
  });
});
