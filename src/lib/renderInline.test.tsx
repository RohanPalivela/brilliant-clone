import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderInline, renderMarkdownInline, highlightPlain } from './renderInline';

describe('renderMarkdownInline', () => {
  it('renders **bold** as <strong>, not literal asterisks', () => {
    const { container } = render(<p>{renderMarkdownInline('see **Making Change** later', 'k')}</p>);
    const strong = container.querySelector('strong');
    expect(strong?.textContent).toBe('Making Change');
    expect(container.textContent).toBe('see Making Change later');
  });

  it('renders *italic* as <em>', () => {
    const { container } = render(<p>{renderMarkdownInline('this is *important* stuff', 'k')}</p>);
    expect(container.querySelector('em')?.textContent).toBe('important');
  });

  it('renders `code` spans as code chips', () => {
    const { container } = render(<p>{renderMarkdownInline('use `reachable[3]` here', 'k')}</p>);
    expect(container.querySelector('code')?.textContent).toBe('reachable[3]');
  });

  it('leaves spaced arithmetic like 3 * 5 alone (no stray italics)', () => {
    const { container } = render(<p>{renderMarkdownInline('go up 3 * 5 steps', 'k')}</p>);
    expect(container.querySelector('em')).toBeNull();
    expect(container.textContent).toBe('go up 3 * 5 steps');
  });
});

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
