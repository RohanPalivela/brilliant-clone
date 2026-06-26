import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles, X, Send, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';
import type { Course, Lesson, SlideAnswer } from '../../types/content';
import type { ChatTurn, NavigationTarget } from '../../lib/aiTutor/types';
import { buildTutorContext } from '../../lib/aiTutor/context';
import { isActivitySlide } from '../../lib/aiTutor/solution';
import { stripNavForDisplay } from '../../lib/aiTutor/sanitize';
import { isTutorConfigured } from '../../lib/aiTutor/config';
import { useTutor } from '../../hooks/useTutor';
import { useTutorChat } from '../../hooks/useTutorChat';
import { renderInline } from '../../lib/renderInline';
import { cn } from '../../lib/cn';

interface TutorWidgetProps {
  course: Course;
  lesson: Lesson;
  slideIndex: number;
  answer: SlideAnswer;
  solvedCorrectly: boolean;
  /** Handle a confirmed navigation (same-lesson jump vs cross-lesson route). */
  onNavigate: (target: NavigationTarget) => void;
}

export function TutorWidget({
  course,
  lesson,
  slideIndex,
  answer,
  solvedCorrectly,
  onNavigate,
}: TutorWidgetProps) {
  const reduce = useReducedMotion();
  const { isOpen, open, close, turns } = useTutor();
  const configured = isTutorConfigured();

  const context = useMemo(
    () => buildTutorContext(course, lesson, slideIndex, answer, solvedCorrectly),
    [course, lesson, slideIndex, answer, solvedCorrectly],
  );
  const onActivity = isActivitySlide(context.slide);

  const { send, isStreaming } = useTutorChat({ context, course, lesson });
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the latest turn in view as replies stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, isOpen]);

  const submit = () => {
    if (!draft.trim() || isStreaming) return;
    void send(draft);
    setDraft('');
  };

  // When the tutor is turned off for this site, render nothing at all — a learner
  // should never see a broken/disabled tutor or any developer configuration hint.
  if (!configured) return null;

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            onClick={open}
            aria-label="Open AI tutor"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? undefined : { scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-cta text-white shadow-card transition-colors hover:bg-cta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="AI tutor"
            initial={reduce ? false : { y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-5 right-5 z-30 flex h-[32rem] max-h-[calc(100vh-2.5rem)] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
          >
            {/* Header */}
            <header className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">Sage · AI tutor</p>
                <p className="truncate text-xs text-muted">{lesson.title}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close AI tutor"
                className="rounded-full p-1.5 text-muted hover:bg-canvas hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            {/* Activity safeguard badge */}
            {onActivity && (
              <div className="flex items-center gap-1.5 bg-brand-soft/60 px-4 py-1.5 text-xs text-brand">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Guided help only — I won’t give away the answer here.
              </div>
            )}

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {turns.length === 0 && <EmptyState onActivity={onActivity} />}
              {turns.map((turn) => (
                <div
                  key={turn.id}
                  className={cn(
                    'flex',
                    turn.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                      turn.role === 'user'
                        ? 'bg-cta text-white'
                        : turn.error
                          ? 'bg-wrong-soft text-wrong'
                          : 'bg-canvas text-ink',
                    )}
                  >
                    <MessageBody turn={turn} />
                    {turn.nav && (
                      <ResourceCard nav={turn.nav} onNavigate={onNavigate} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="border-t border-line p-3"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  disabled={isStreaming}
                  rows={1}
                  placeholder="Ask for a hint…"
                  aria-label="Message the tutor"
                  className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !draft.trim()}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cta text-white transition-colors hover:bg-cta-hover disabled:bg-line disabled:text-muted"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function EmptyState({ onActivity }: { onActivity: boolean }) {
  return (
    <div className="mt-6 text-center text-sm text-muted">
      <p className="font-semibold text-ink">Hi, I’m Sage 👋</p>
      <p className="mt-1">
        {onActivity
          ? 'Stuck on this step? Ask me for a nudge and I’ll help you reason it out — without spoiling the answer.'
          : 'Ask me anything about this lesson. I can also walk you back to an earlier part if it helps.'}
      </p>
    </div>
  );
}

/**
 * Render a chat turn's body. Assistant replies are run through `renderInline` so
 * `backtick` spans become formatted code chips (e.g. `reachable[3]`); the
 * container's `whitespace-pre-wrap` preserves the model's line breaks. Empty
 * pending assistant turns show the typing indicator.
 */
function MessageBody({ turn }: { turn: ChatTurn }) {
  const display = stripNavForDisplay(turn.text);
  if (!display) return turn.pending ? <TypingDots /> : null;
  if (turn.role === 'assistant' && !turn.error) {
    return <>{renderInline(display, turn.id)}</>;
  }
  return <>{display}</>;
}

/**
 * A confirmed-by-tap navigation surfaced as a supplementary "resource" beneath
 * the reply: it frames the earlier slide as optional further reading (with the
 * tutor's reason) rather than a command, so it can ride along with every helpful
 * answer without feeling pushy.
 */
function ResourceCard({
  nav,
  onNavigate,
}: {
  nav: NavigationTarget;
  onNavigate: (target: NavigationTarget) => void;
}) {
  return (
    <div className="mt-2.5 rounded-xl border border-brand/25 bg-surface p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-brand">
        <BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />
        Suggested resource
      </div>
      {nav.reason && (
        <p className="mb-2 text-xs leading-snug text-muted">{nav.reason}</p>
      )}
      <button
        type="button"
        onClick={() => onNavigate(nav)}
        className="flex w-full items-center gap-2 rounded-lg bg-brand-soft px-3 py-1.5 text-left text-xs font-semibold text-brand transition-colors hover:bg-brand/15"
      >
        <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">
          Take me to {nav.lessonTitle} · step {nav.slideIndex + 1}
        </span>
      </button>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1" aria-label="Tutor is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
