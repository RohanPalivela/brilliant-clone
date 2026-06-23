import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeBlanks } from './CodeBlanks';
import type { CodeBlanksProps, SlideAnswer } from '../../types/content';

const config: CodeBlanksProps = {
  codeLines: [
    [
      { type: 'text', value: 'reachable[' },
      { type: 'blank', id: 'ground' },
      { type: 'text', value: '] = True' },
    ],
  ],
  tokens: [
    { id: 'zero', label: '0' },
    { id: 'i', label: 'i' },
  ],
};

const emptyAnswer: SlideAnswer = { kind: 'blanks', filled: {} };

describe('CodeBlanks', () => {
  it('renders the code text and an empty blank', () => {
    render(<CodeBlanks config={config} answer={emptyAnswer} onAnswer={() => {}} />);
    expect(screen.getByText('] = True')).toBeInTheDocument();
    expect(screen.getByLabelText('Empty blank')).toBeInTheDocument();
  });

  it('places a token into a blank via tap-to-place', async () => {
    const onAnswer = vi.fn();
    const user = userEvent.setup();
    render(<CodeBlanks config={config} answer={emptyAnswer} onAnswer={onAnswer} />);
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByLabelText('Empty blank'));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: 'blanks',
      filled: { ground: 'zero' },
    });
  });

  it('disables a token once it is used and labels the filled blank', () => {
    render(
      <CodeBlanks
        config={config}
        answer={{ kind: 'blanks', filled: { ground: 'zero' } }}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: '0' })).toBeDisabled();
    expect(screen.getByLabelText('Blank filled with 0')).toBeInTheDocument();
  });

  it('clears a filled blank when tapped with no token selected', async () => {
    const onAnswer = vi.fn();
    const user = userEvent.setup();
    render(
      <CodeBlanks
        config={config}
        answer={{ kind: 'blanks', filled: { ground: 'zero' } }}
        onAnswer={onAnswer}
      />,
    );
    await user.click(screen.getByLabelText('Blank filled with 0'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'blanks', filled: {} });
  });

  it('places a token via drag and drop', () => {
    const onAnswer = vi.fn();
    render(<CodeBlanks config={config} answer={emptyAnswer} onAnswer={onAnswer} />);
    fireEvent.drop(screen.getByLabelText('Empty blank'), {
      dataTransfer: { getData: () => 'i' },
    });
    expect(onAnswer).toHaveBeenCalledWith({
      kind: 'blanks',
      filled: { ground: 'i' },
    });
  });

  it('outlines a wrong blank after check when showMistakes is on', () => {
    render(
      <CodeBlanks
        config={config}
        answer={{ kind: 'blanks', filled: { ground: 'i' } }}
        onAnswer={() => {}}
        showMistakes
        correct={{ ground: 'zero' }}
      />,
    );
    expect(screen.getByLabelText('Blank filled with i').className).toContain(
      'border-wrong',
    );
  });
});
