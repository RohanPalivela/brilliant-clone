import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderInline, highlightPlain } from './renderInline';

describe('renderInline', () => {
  it('renders backtick spans as code chips', () => {
    const { container } = render(<p>{renderInline('check `step 7` now', 'k')}</p>);
    const code = container.querySelector('code');
    expect(code?.textContent).toBe('step 7');
  });

  it('wraps a matched highlight phrase in a spotlight mark (case-insensitive)', () => {
    const { container } = render(
      <p>{renderInline('Look backward, not forward', 'k', 'look BACKWARD')}</p>,
    );
    const mark = container.querySelector('mark.tutor-highlight');
    expect(mark).not.toBeNull();
    expect(mark?.textContent).toBe('Look backward');
  });

  it('keeps code chips when they fall inside the highlighted span', () => {
    const { container } = render(
      <p>{renderInline('decide `step 7` carefully', 'k', 'decide `step 7`')}</p>,
    );
    const mark = container.querySelector('mark.tutor-highlight');
    expect(mark?.querySelector('code')?.textContent).toBe('step 7');
  });

  it('renders plainly when the highlight is absent from the text', () => {
    const { container } = render(
      <p>{renderInline('nothing to see', 'k', 'absent phrase')}</p>,
    );
    expect(container.querySelector('mark')).toBeNull();
    expect(container.textContent).toBe('nothing to see');
  });
});

describe('highlightPlain', () => {
  it('wraps the matched phrase in a mark', () => {
    const { container } = render(<p>{highlightPlain('build big from smaller', 'k', 'big')}</p>);
    const mark = container.querySelector('mark.tutor-highlight');
    expect(mark?.textContent).toBe('big');
  });

  it('returns the text unchanged with no highlight', () => {
    const { container } = render(<p>{highlightPlain('plain text', 'k')}</p>);
    expect(container.querySelector('mark')).toBeNull();
    expect(container.textContent).toBe('plain text');
  });
});
