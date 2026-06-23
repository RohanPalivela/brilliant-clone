import { useState, type DragEvent } from 'react';
import type { CodeBlanksProps, SlideAnswer } from '../../types/content';
import { cn } from '../../lib/cn';

interface Props {
  config: CodeBlanksProps;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  /** After a wrong submit, outline blanks that don't match the solution. */
  showMistakes?: boolean;
  correct?: Record<string, string>;
}

// Fill-in-the-blank coding widget. Learners place palette tokens into the blanks
// in a snippet — by tap-to-place (tap a token, then a blank) or native drag.
export function CodeBlanks({
  config,
  answer,
  onAnswer,
  showMistakes,
  correct = {},
}: Props) {
  const filled = answer.kind === 'blanks' ? answer.filled : {};
  const [selected, setSelected] = useState<string | null>(null);

  const usedTokenIds = new Set(Object.values(filled));
  const tokenLabel = (id: string) =>
    config.tokens.find((t) => t.id === id)?.label ?? id;

  const place = (blankId: string, tokenId: string) => {
    const next: Record<string, string> = {};
    // A token lives in one blank at a time: drop it from any prior blank.
    for (const [bId, tId] of Object.entries(filled)) {
      if (tId !== tokenId && bId !== blankId) next[bId] = tId;
    }
    next[blankId] = tokenId;
    onAnswer({ kind: 'blanks', filled: next });
    setSelected(null);
  };

  const clear = (blankId: string) => {
    const next = { ...filled };
    delete next[blankId];
    onAnswer({ kind: 'blanks', filled: next });
  };

  const handleBlankClick = (blankId: string) => {
    if (selected) {
      place(blankId, selected);
    } else if (filled[blankId]) {
      clear(blankId);
    }
  };

  const handleTokenClick = (tokenId: string) => {
    if (usedTokenIds.has(tokenId)) return;
    setSelected((cur) => (cur === tokenId ? null : tokenId));
  };

  const onDrop = (e: DragEvent, blankId: string) => {
    e.preventDefault();
    const tokenId = e.dataTransfer.getData('text/plain');
    if (tokenId) place(blankId, tokenId);
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-xl overflow-x-auto rounded-xl bg-cta px-5 py-4 text-left font-mono text-sm leading-7 text-white">
        {config.codeLines.map((line, li) => (
          <div key={li} className="whitespace-pre">
            {line.length === 0 ? (
              '\u00A0'
            ) : (
              line.map((tok, ti) => {
                if (tok.type === 'text') {
                  return <span key={ti}>{tok.value}</span>;
                }
                const tokenId = filled[tok.id];
                const isWrong =
                  showMistakes && correct[tok.id] !== undefined &&
                  tokenId !== correct[tok.id];
                return (
                  <button
                    key={ti}
                    type="button"
                    onClick={() => handleBlankClick(tok.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, tok.id)}
                    aria-label={
                      tokenId
                        ? `Blank filled with ${tokenLabel(tokenId)}`
                        : 'Empty blank'
                    }
                    className={cn(
                      'mx-0.5 inline-flex min-w-12 items-center justify-center rounded-md border-2 px-2 py-0.5 align-middle font-mono text-sm transition-colors',
                      tokenId
                        ? 'border-brand bg-brand text-white'
                        : 'border-dashed border-white/50 bg-white/10 text-white/40 hover:border-white',
                      isWrong && 'border-wrong bg-wrong text-white',
                      selected && !tokenId && 'border-white bg-white/20',
                    )}
                  >
                    {tokenId ? tokenLabel(tokenId) : '___'}
                  </button>
                );
              })
            )}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-5 flex max-w-xl flex-wrap justify-center gap-2">
        {config.tokens.map((tok) => {
          const used = usedTokenIds.has(tok.id);
          const isSelected = selected === tok.id;
          return (
            <button
              key={tok.id}
              type="button"
              draggable={!used}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', tok.id)}
              onClick={() => handleTokenClick(tok.id)}
              disabled={used}
              className={cn(
                'rounded-lg border-2 px-3 py-2 font-mono text-sm font-medium transition-all',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                used
                  ? 'cursor-default border-line bg-canvas text-muted opacity-40'
                  : 'cursor-grab border-line bg-white text-ink hover:border-brand active:cursor-grabbing',
                isSelected && 'border-brand bg-brand-soft ring-2 ring-brand',
              )}
            >
              {tok.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
