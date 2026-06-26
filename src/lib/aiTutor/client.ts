import { getTutorConfig } from './config';
import type { TutorMessage } from './types';

/** Raised when the tutor backend is unreachable or returns an error. */
export class TutorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TutorError';
  }
}

export interface StreamOptions {
  /** Called with each incremental token of text as it streams in. */
  onToken?: (delta: string) => void;
  /** Abort the in-flight request (e.g. the learner closed the panel). */
  signal?: AbortSignal;
}

/**
 * Reasoning models (the GPT-5 series, o-series) don't accept a custom
 * `temperature` on chat-completions — passing one returns a 400. Instead they
 * take a `reasoning_effort`. We detect them by slug so the request body can be
 * shaped correctly without the caller having to care.
 */
export function isReasoningModel(model: string): boolean {
  const m = model.toLowerCase();
  return m.startsWith('gpt-5') || /^o\d/.test(m);
}

/**
 * Build the chat-completions request body for a model. Reasoning models get
 * `reasoning_effort: 'low'` (keeps the tutor snappy) and no temperature;
 * classic models keep the low temperature that made coaching deterministic.
 */
export function buildRequestBody(model: string, messages: TutorMessage[]): Record<string, unknown> {
  const body: Record<string, unknown> = { model, messages, stream: true };
  if (isReasoningModel(model)) {
    body.reasoning_effort = 'low';
  } else {
    body.temperature = 0.3;
  }
  return body;
}

/**
 * Pull the incremental text out of one streamed chat-completions JSON payload.
 * Pure and exported so the SSE handling can be unit-tested without a network.
 */
export function extractDelta(dataLine: string): string {
  try {
    const json = JSON.parse(dataLine) as {
      choices?: { delta?: { content?: string }; message?: { content?: string } }[];
    };
    const choice = json.choices?.[0];
    return choice?.delta?.content ?? choice?.message?.content ?? '';
  } catch {
    return '';
  }
}

/**
 * Send the conversation to an OpenAI-compatible chat-completions endpoint and
 * stream the assistant reply. Returns the full text once complete. All network
 * access is confined to this function so the rest of the feature can be tested
 * by mocking this module.
 */
export async function streamTutorReply(
  messages: TutorMessage[],
  options: StreamOptions = {},
): Promise<string> {
  const { apiKey, baseUrl, model } = getTutorConfig();
  if (!apiKey) {
    throw new TutorError('The AI tutor is not configured. Add VITE_AI_TUTOR_API_KEY.');
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(model, messages)),
      signal: options.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    throw new TutorError('Could not reach the tutor service. Check your connection.');
  }

  if (!res.ok) {
    throw new TutorError(`Tutor service error (${res.status}). Please try again.`);
  }

  // No stream body available (some proxies / test mocks): fall back to JSON.
  if (!res.body) {
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const full = json.choices?.[0]?.message?.content ?? '';
    options.onToken?.(full);
    return full;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    // Keep the last (possibly partial) line in the buffer.
    buffer = lines.pop() ?? '';

    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') return full;
      const delta = extractDelta(data);
      if (delta) {
        full += delta;
        options.onToken?.(delta);
      }
    }
  }

  return full;
}
