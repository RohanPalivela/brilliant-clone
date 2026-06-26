import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles, X, Send, ArrowRight, BookOpen } from 'lucide-react';
import type { Course, Lesson, SlideAnswer } from '../../types/content';
import type { ChatTurn, NavigationTarget } from '../../lib/aiTutor/types';
import { buildTutorContext } from '../../lib/aiTutor/context';
import { isActivitySlide } from '../../lib/aiTutor/solution';
import { stripNavForDisplay } from '../../lib/aiTutor/sanitize';
import { isTutorConfigured } from '../../lib/aiTutor/config';
import { useTutor } from '../../hooks/useTutor';
import { useTutorChat } from '../../hooks/useTutorChat';
import { renderMarkdownInline } from '../../lib/renderInline';
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
            whileHover={reduce ? undefined : { scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            className="group fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {/* Living halo — Sage's calm presence (still under reduced motion). */}
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] blur-lg"
              initial={false}
              animate={reduce ? { opacity: 0.35 } : { opacity: [0.3, 0.5, 0.3], scale: [1, 1.12, 1] }}
              transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] via-[#6d5ef0] to-[#8b5cf6] text-white shadow-card ring-1 ring-white/15">
              <Sparkles className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
            </span>
            <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-canvas bg-correct" />
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
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 right-5 z-30 flex h-[34rem] max-h-[calc(100vh-2.5rem)] w-[min(25rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[20px] border border-line bg-surface shadow-card"
          >
            {/* Header */}
            <header className="relative flex items-center gap-3 border-b border-line px-4 py-3">
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
              <SageMark size="sm" presence />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <p className="font-display text-base font-semibold leading-none text-ink">Sage</p>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">AI tutor</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted">{lesson.title}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close AI tutor"
                className="rounded-full p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            >
              {turns.length === 0 ? (
                <EmptyState
                  onActivity={onActivity}
                  disabled={isStreaming}
                  onPrompt={(text) => void send(text)}
                />
              ) : (
                turns.map((turn, i) => {
                  const isUser = turn.role === 'user';
                  // Group consecutive assistant turns under a single avatar gutter.
                  const showAvatar =
                    !isUser && (i === 0 || turns[i - 1].role !== 'assistant');
                  return (
                    <motion.div
                      key={turn.id}
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}
                    >
                      {!isUser && (
                        <span className="shrink-0">
                          {showAvatar ? <SageMark size="xs" /> : <span className="block h-7 w-7" aria-hidden="true" />}
                        </span>
                      )}
                      <div
                        className={cn(
                          'max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                          isUser
                            ? 'rounded-br-md bg-cta text-white'
                            : turn.error
                              ? 'rounded-bl-md bg-wrong-soft text-wrong'
                              : 'rounded-bl-md bg-canvas text-ink',
                        )}
                      >
                        <MessageBody turn={turn} />
                        {turn.nav && (
                          <ResourceCard nav={turn.nav} onNavigate={onNavigate} />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="border-t border-line bg-surface p-3"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-line bg-canvas p-1.5 transition-colors focus-within:border-brand/60">
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
                  placeholder={onActivity ? 'Ask for a hint…' : 'Ask Sage anything…'}
                  aria-label="Message the tutor"
                  className="max-h-28 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm text-ink placeholder:text-muted focus-visible:outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !draft.trim()}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cta text-white transition-all hover:bg-cta-hover disabled:bg-line disabled:text-muted"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p
                className={cn(
                  'mt-1.5 px-1 text-[0.65rem] text-muted transition-opacity',
                  draft.trim() ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden="true"
              >
                <kbd className="font-sans font-semibold text-ink-soft">Enter</kbd> to send ·{' '}
                <kbd className="font-sans font-semibold text-ink-soft">Shift + Enter</kbd> for a new line
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Sage's identity mark — a gradient "presence" used on the launcher, in the
 * header, and as the assistant avatar so the tutor reads as one consistent
 * character across the whole surface.
 */
function SageMark({
  size = 'sm',
  presence = false,
}: {
  size?: 'xs' | 'sm';
  presence?: boolean;
}) {
  const box = size === 'xs' ? 'h-7 w-7' : 'h-9 w-9';
  const icon = size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] via-[#6d5ef0] to-[#8b5cf6] text-white ring-1 ring-white/15',
          box,
        )}
      >
        <Sparkles className={icon} aria-hidden="true" />
      </span>
      {presence && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-correct" />
      )}
    </span>
  );
}

const ACTIVITY_PROMPTS = [
  'I’m stuck, give me a nudge',
  'Explain this idea again',
  'What should I focus on?',
];

const LESSON_PROMPTS = [
  'Summarize this lesson',
  'Explain it more simply',
  'Where did this come from?',
];

function EmptyState({
  onActivity,
  onPrompt,
  disabled,
}: {
  onActivity: boolean;
  onPrompt: (text: string) => void;
  disabled: boolean;
}) {
  const prompts = onActivity ? ACTIVITY_PROMPTS : LESSON_PROMPTS;
  return (
    <div className="flex h-full flex-col items-center justify-center px-2 text-center">
      <SageMark size="sm" />
      <p className="mt-3 font-display text-base font-semibold text-ink">Hi, I’m Sage</p>
      <p className="mx-auto mt-1 max-w-[18rem] text-sm leading-relaxed text-muted">
        {onActivity
          ? 'Stuck on this step? Ask me for a nudge and I’ll help you reason it out.'
          : 'Ask me anything about this lesson. I can also walk you back to an earlier part if it helps.'}
      </p>
      <div className="mt-4 flex w-full flex-col items-stretch gap-2">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            disabled={disabled}
            onClick={() => onPrompt(p)}
            className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-left text-sm font-medium text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft/50 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span className="truncate">{p}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Render a chat turn's body. Assistant replies are run through
 * `renderMarkdownInline` so inline markdown the model emits — ``code``,
 * `**bold**`, `*italic*` — renders as real formatting instead of literal
 * asterisks/backticks; the container's `whitespace-pre-wrap` preserves the
 * model's line breaks. Empty pending assistant turns show the typing indicator.
 */
function MessageBody({ turn }: { turn: ChatTurn }) {
  const display = stripNavForDisplay(turn.text);
  if (!display) return turn.pending ? <TypingDots /> : null;
  if (turn.role === 'assistant' && !turn.error) {
    return <>{renderMarkdownInline(display, turn.id)}</>;
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
