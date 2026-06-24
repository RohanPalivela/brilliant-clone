import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MinChoicePicker } from './MinChoicePicker';
import type { MinChoicePickerProps, SlideAnswer } from '../../types/content';

// Coins {1,3,4}, amount 6. best[5]=2, best[3]=1, best[2]=2, so laying a 3
// (→ make 3 in 1 coin → 2 total) is the cheapest first move.
const config: MinChoicePickerProps = { coins: [1, 3, 4], amount: 6 };
const empty: SlideAnswer = { kind: 'choice', selectedIds: [] };

describe('MinChoicePicker', () => {
  it('renders one playable card per coin that fits', () => {
    render(<MinChoicePicker config={config} answer={empty} onAnswer={() => {}} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('reports the chosen coin as a choice answer', () => {
    const onAnswer = vi.fn();
    render(<MinChoicePicker config={config} answer={empty} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByLabelText('Lay down a 3 coin, then make 3'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'choice', selectedIds: ['c3'] });
  });

  it('shows the subproblem total for each coin', () => {
    render(<MinChoicePicker config={config} answer={empty} onAnswer={() => {}} />);
    // Laying a 3 leaves make 3 → 1 + best[3] = 2.
    expect(screen.getByText('1 + best[3] = 2')).toBeInTheDocument();
  });

  it('marks the optimal card the learner missed when mistakes show', () => {
    render(
      <MinChoicePicker
        config={config}
        answer={{ kind: 'choice', selectedIds: ['c1'] }}
        onAnswer={() => {}}
        showMistakes
      />,
    );
    const missed = screen.getByLabelText('Lay down a 3 coin, then make 3');
    expect(missed.className).toMatch(/border-correct/);
  });
});
