import { Check } from 'lucide-react';
import type { MultipleChoiceProps, SlideAnswer } from '../../types/content';
import { cn } from '../../lib/cn';

interface Props {
  config: MultipleChoiceProps;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  /** After a wrong submit, mark which selected options were incorrect. */
  showMistakes?: boolean;
  correctIds?: string[];
}

// Turn `backtick` spans into highlighted chips so the concrete facts (steps,
// arithmetic) stand out from the surrounding sentence.
function renderInline(text: string, keyPrefix: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) => {
    if (part.length >= 2 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={`${keyPrefix}-${i}`}
          className="mx-0.5 rounded border border-code-border bg-code-bg px-1.5 py-0.5 align-middle font-mono text-[0.85em] text-code-text"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

// A question may be written as several lines (separated by \n): the supporting
// facts in calm text, and the actual question (the line ending in "?") pulled
// out as a bold prompt. This keeps dense questions from reading as one blur.
function Question({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  return (
    <div className="mx-auto mb-6 flex max-w-md flex-col gap-2.5">
      {lines.map((line, i) => {
        const isAsk = line.trim().endsWith('?');
        return (
          <p
            key={i}
            className={cn(
              'leading-relaxed',
              isAsk
                ? 'text-lg font-bold text-ink'
                : 'text-sm text-ink-soft',
            )}
          >
            {renderInline(line, `q${i}`)}
          </p>
        );
      })}
    </div>
  );
}

export function MultipleChoice({
  config,
  answer,
  onAnswer,
  showMistakes,
  correctIds = [],
}: Props) {
  const selected = answer.kind === 'choice' ? answer.selectedIds : [];
  const { multiSelect } = config;

  const toggle = (id: string) => {
    let next: string[];
    if (multiSelect) {
      next = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];
    } else {
      next = [id];
    }
    onAnswer({ kind: 'choice', selectedIds: next });
  };

  return (
    <fieldset className="w-full">
      <Question text={config.question} />
      <div className="mx-auto flex max-w-md flex-col gap-3">
        {config.options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          const isCorrect = correctIds.includes(opt.id);
          const wrongPick = showMistakes && isSelected && !isCorrect;
          const missedPick = showMistakes && !isSelected && isCorrect;

          return (
            <button
              key={opt.id}
              type="button"
              role={multiSelect ? 'checkbox' : 'radio'}
              aria-checked={isSelected}
              onClick={() => toggle(opt.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                isSelected
                  ? 'border-brand bg-brand-soft text-ink'
                  : 'border-line bg-surface text-ink-soft hover:border-brand/40',
                wrongPick && 'border-wrong bg-wrong-soft text-wrong',
                missedPick && 'border-correct bg-correct-soft text-correct',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center border-2',
                  multiSelect ? 'rounded-md' : 'rounded-full',
                  isSelected ? 'border-brand bg-brand text-white' : 'border-line',
                  wrongPick && 'border-wrong bg-wrong',
                  missedPick && 'border-correct bg-correct',
                )}
              >
                {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
