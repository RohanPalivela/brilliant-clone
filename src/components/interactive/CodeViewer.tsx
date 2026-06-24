import { useState } from 'react';
import type { CodeViewerProps } from '../../types/content';
import { cn } from '../../lib/cn';

interface Props {
  config: CodeViewerProps;
}

// A read-only code panel dressed as an editor window: a title bar with
// traffic-light dots and a filename, a row of language tabs, and a numbered,
// monospace body. Switching tabs swaps the same program between languages.
export function CodeViewer({ config }: Props) {
  const { filename = 'solution', tabs } = config;
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const lines = active.code.split('\n');

  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-code-border shadow-card">
      <div className="flex items-center gap-2 border-b border-code-border bg-code-bar px-4 py-2.5">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-wrong" />
          <span className="h-3 w-3 rounded-full bg-flame" />
          <span className="h-3 w-3 rounded-full bg-correct" />
        </span>
        <span className="ml-2 font-mono text-xs text-code-muted">
          {filename}.{active.language}
        </span>
      </div>

      <div
        className="flex border-b border-code-border bg-code-bar"
        role="tablist"
        aria-label="Choose a language"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                'border-b-2 px-4 py-2 font-mono text-xs font-semibold transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                isActive
                  ? 'border-brand bg-code-bg text-code-text'
                  : 'border-transparent text-code-muted hover:text-code-text',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <pre className="overflow-x-auto bg-code-bg px-4 py-4 text-left font-mono text-[13px] leading-6 text-code-text">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 w-6 shrink-0 select-none text-right text-code-muted tabular-nums">
                {i + 1}
              </span>
              <span className="whitespace-pre">{line === '' ? '\u00A0' : line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
