import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoinSweep } from './CoinSweep';
import type { CoinSweepProps } from '../../types/content';

const config: CoinSweepProps = { coins: [4, 5], amount: 13 };

describe('CoinSweep', () => {
  it('renders a coin chip per denomination', () => {
    render(<CoinSweep config={config} />);
    expect(screen.getByText('4¢')).toBeInTheDocument();
    expect(screen.getByText('5¢')).toBeInTheDocument();
  });

  it('starts on the base case (amount 0) and explains it', () => {
    render(<CoinSweep config={config} />);
    expect(screen.getByText('Amount 0')).toBeInTheDocument();
    expect(screen.getByText(/always make 0/i)).toBeInTheDocument();
  });

  it('keeps the staircase equivalence message on screen', () => {
    render(<CoinSweep config={config} />);
    expect(screen.getByText(/a coin is a jump, an amount is a step/i)).toBeInTheDocument();
  });

  it('scrubs forward to the next amount and shows its look-backs', async () => {
    const user = userEvent.setup();
    render(<CoinSweep config={config} />);
    // Advancing four times lands on amount 4, whose only look-back is 4 − 4 = 0.
    const next = screen.getByRole('button', { name: /next amount/i });
    for (let i = 0; i < 4; i++) await user.click(next);
    expect(screen.getByText('Amount 4')).toBeInTheDocument();
    expect(screen.getByText('4 − 4 = 0')).toBeInTheDocument();
  });

  it('disables Back on the first frame', () => {
    render(<CoinSweep config={config} />);
    expect(screen.getByRole('button', { name: /previous amount/i })).toBeDisabled();
  });
});
