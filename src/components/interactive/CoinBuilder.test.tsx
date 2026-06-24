import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoinBuilder } from './CoinBuilder';
import type { CoinBuilderProps, SlideAnswer } from '../../types/content';

const config: CoinBuilderProps = { coins: [3, 5], target: 11 };
const empty: SlideAnswer = { kind: 'coins', picks: [] };

describe('CoinBuilder', () => {
  it('adds a coin to the tray on tap', () => {
    const onAnswer = vi.fn();
    render(<CoinBuilder config={config} answer={empty} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByLabelText('Add a 3 coin'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'coins', picks: [3] });
  });

  it('keeps duplicates in order as more coins are added', () => {
    const onAnswer = vi.fn();
    render(
      <CoinBuilder
        config={config}
        answer={{ kind: 'coins', picks: [3, 3] }}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.click(screen.getByLabelText('Add a 5 coin'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'coins', picks: [3, 3, 5] });
  });

  it('removes a single coin instance from the tray', () => {
    const onAnswer = vi.fn();
    render(
      <CoinBuilder
        config={config}
        answer={{ kind: 'coins', picks: [3, 5] }}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.click(screen.getByLabelText('Remove 5 coin'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'coins', picks: [3] });
  });

  it('shows the running total against the target', () => {
    render(
      <CoinBuilder
        config={config}
        answer={{ kind: 'coins', picks: [3, 5] }}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText('8 / 11')).toBeInTheDocument();
  });

  it('celebrates an exact build', () => {
    render(
      <CoinBuilder
        config={config}
        answer={{ kind: 'coins', picks: [3, 3, 5] }}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText('That makes 11.')).toBeInTheDocument();
  });

  it('warns when the build overshoots the target', () => {
    render(
      <CoinBuilder
        config={config}
        answer={{ kind: 'coins', picks: [5, 5, 5] }}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText(/overshoots 11/)).toBeInTheDocument();
  });

  it('in fewest mode, flags an exact-but-wasteful build when mistakes show', () => {
    render(
      <CoinBuilder
        config={{ coins: [1, 3, 4], target: 6, fewest: true }}
        answer={{ kind: 'coins', picks: [4, 1, 1] }}
        onAnswer={() => {}}
        showMistakes
      />,
    );
    // 4+1+1 = 6 but uses 3 coins; the optimum is 2 (3+3).
    expect(screen.getByText(/it can be done in/)).toBeInTheDocument();
  });
});
