import { useCallback, useEffect, useRef, useState } from 'react';
import type { Course, Lesson } from '../types/content';
import type { ChatTurn, TutorContext, TutorMessage } from '../lib/aiTutor/types';
import { buildSystemPrompt } from '../lib/aiTutor/context';
import { parseReply, resolveNavigation } from '../lib/aiTutor/navigation';
import { streamTutorReply, TutorError } from '../lib/aiTutor/client';
import { makeNonce, wrapUntrusted } from '../lib/aiTutor/sanitize';
import { useTutor } from './useTutor';

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `t${Date.now()}${Math.random().toString(16).slice(2)}`;
}

interface UseTutorChatArgs {
  context: TutorContext;
  course: Course;
  lesson: Lesson;
}

/**
 * Orchestrates a tutor turn: appends the learner's message, streams the reply,
 * parses out any navigation directive, and resolves it to a safe target. All
 * network access goes through the mockable `streamTutorReply`, and the system
 * prompt is rebuilt from the *current* lesson context on every send so the
 * tutor always reasons about where the learner actually is.
 */
export function useTutorChat({ context, course, lesson }: UseTutorChatArgs) {
  const { turns, setTurns } = useTutor();
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isStreaming) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // A fresh per-request nonce fences the learner's text so it can never be
      // mistaken for (or escape into) instructions. Both the system prompt and
      // every user turn use the same token for this request.
      const nonce = makeNonce();

      // Build the API history from existing turns *before* we add the new ones.
      // User turns are wrapped as untrusted data; assistant turns are passed
      // through (the model's own prior, already-sanitized output).
      const history: TutorMessage[] = turns
        .filter((t) => !t.error && t.text.trim().length > 0)
        .map((t) => ({
          role: t.role,
          content: t.role === 'user' ? wrapUntrusted(t.text, nonce) : t.text,
        }));

      const userTurn: ChatTurn = { id: newId(), role: 'user', text };
      const assistantId = newId();
      const assistantTurn: ChatTurn = {
        id: assistantId,
        role: 'assistant',
        text: '',
        pending: true,
      };
      setTurns((prev) => [...prev, userTurn, assistantTurn]);
      setIsStreaming(true);

      const messages: TutorMessage[] = [
        { role: 'system', content: buildSystemPrompt(context, nonce) },
        ...history,
        { role: 'user', content: wrapUntrusted(text, nonce) },
      ];

      try {
        const full = await streamTutorReply(messages, {
          signal: controller.signal,
          onToken: (delta) => {
            setTurns((prev) =>
              prev.map((t) =>
                t.id === assistantId ? { ...t, text: t.text + delta } : t,
              ),
            );
          },
        });

        const { text: cleanText, directive } = parseReply(full);
        const nav = resolveNavigation(course, lesson, directive) ?? undefined;
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantId
              ? { ...t, text: cleanText || t.text, nav, pending: false }
              : t,
          ),
        );
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        const message =
          err instanceof TutorError
            ? err.message
            : 'Something went wrong reaching the tutor. Please try again.';
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantId
              ? { ...t, text: message, pending: false, error: true }
              : t,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [context, course, lesson, turns, setTurns, isStreaming],
  );

  return { turns, send, isStreaming };
}
