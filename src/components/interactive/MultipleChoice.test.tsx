import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultipleChoice } from './MultipleChoice';
import type { MultipleChoiceProps, SlideAnswer } from '../../types/content';

const single: MultipleChoiceProps = {
  question: 'Is step 7 reachable?',
  options: [
    { id: 'reach', label: 'Reachable' },
    { id: 'no', label: 'Not reachable' },
  ],
};

const multi: MultipleChoiceProps = {
  question: 'Select all DP problems',
  multiSelect: true,
  options: [
    { id: 'reach', label: 'Reachability' },
    { id: 'fib', label: 'Fibonacci' },
    { id: 'max', label: 'Find max' },
  ],
};

const none: SlideAnswer = { kind: 'choice', selectedIds: [] };

describe('MultipleChoice — single select', () => {
  it('renders options as radios', () => {
    render(<MultipleChoice config={single} answer={none} onAnswer={() => {}} />);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('replaces the selection (only one at a time)', async () => {
    const onAnswer = vi.fn();
    const user = userEvent.setup();
    render(<MultipleChoice config={single} answer={none} onAnswer={onAnswer} />);
    await user.click(screen.getByText('Not reachable'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'choice', selectedIds: ['no'] });
  });
});

describe('MultipleChoice — multi select', () => {
  it('renders options as checkboxes', () => {
    render(<MultipleChoice config={multi} answer={none} onAnswer={() => {}} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('adds to the selection', async () => {
    const onAnswer = vi.fn();
    const user = userEvent.setup();
    render(
      <MultipleChoice
        config={multi}
        answer={{ kind: 'choice', selectedIds: ['reach'] }}
        onAnswer={onAnswer}
      />,
    );
    await user.click(screen.getByText('Fibonacci'));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: 'choice',
      selectedIds: ['reach', 'fib'],
    });
  });

  it('removes an already-selected option', async () => {
    const onAnswer = vi.fn();
    const user = userEvent.setup();
    render(
      <MultipleChoice
        config={multi}
        answer={{ kind: 'choice', selectedIds: ['reach', 'fib'] }}
        onAnswer={onAnswer}
      />,
    );
    await user.click(screen.getByText('Reachability'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'choice', selectedIds: ['fib'] });
  });

  it('reflects the selected state via aria-checked', () => {
    render(
      <MultipleChoice
        config={multi}
        answer={{ kind: 'choice', selectedIds: ['fib'] }}
        onAnswer={() => {}}
      />,
    );
    const fib = screen.getByRole('checkbox', { name: /Fibonacci/ });
    expect(fib).toHaveAttribute('aria-checked', 'true');
  });

  it('highlights a wrong pick after check when showMistakes is on', () => {
    render(
      <MultipleChoice
        config={single}
        answer={{ kind: 'choice', selectedIds: ['reach'] }}
        onAnswer={() => {}}
        showMistakes
        correctIds={['no']}
      />,
    );
    const wrong = screen.getByRole('radio', { name: /Reachable/ });
    expect(wrong.className).toContain('border-wrong');
  });
});
