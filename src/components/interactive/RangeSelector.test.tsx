import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RangeSelector } from './RangeSelector';
import type { RangeSelectorProps, SlideAnswer } from '../../types/content';

const config: RangeSelectorProps = {
  min: 1,
  max: 7,
  target: 7,
  goalIndex: 7,
  jumpSizes: [2, 3, 4],
};

const emptyAnswer: SlideAnswer = { kind: 'range', indices: [] };

describe('RangeSelector', () => {
  it('seeds an initial [min, min+1] window on mount', () => {
    const onAnswer = vi.fn();
    render(<RangeSelector config={config} answer={emptyAnswer} onAnswer={onAnswer} />);
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'range', indices: [1, 2] });
  });

  it('exposes slider bounds, excluding the non-selectable goal', () => {
    render(
      <RangeSelector
        config={config}
        answer={{ kind: 'range', indices: [3, 4, 5] }}
        onAnswer={() => {}}
      />,
    );
    const upper = screen.getByRole('slider', { name: 'Upper bound' });
    expect(upper).toHaveAttribute('aria-valuemin', '1');
    // Goal at 7 is not selectable, so the handle max is 6.
    expect(upper).toHaveAttribute('aria-valuemax', '6');
    expect(upper).toHaveAttribute('aria-valuenow', '5');
  });

  it('widens the window when the upper handle moves right', () => {
    const onAnswer = vi.fn();
    render(
      <RangeSelector
        config={config}
        answer={{ kind: 'range', indices: [3, 4, 5] }}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Upper bound' }), {
      key: 'ArrowRight',
    });
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'range', indices: [3, 4, 5, 6] });
  });

  it('never lets a handle select past the goal', () => {
    const onAnswer = vi.fn();
    render(
      <RangeSelector
        config={config}
        answer={{ kind: 'range', indices: [3, 6] }}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Upper bound' }), {
      key: 'ArrowRight',
    });
    // Clamped at 6: the emitted window must not contain the goal index 7.
    for (const call of onAnswer.mock.calls) {
      const answer = call[0] as SlideAnswer;
      if (answer.kind === 'range') expect(answer.indices).not.toContain(7);
    }
  });

  it('renders the goal marker', () => {
    render(<RangeSelector config={config} answer={emptyAnswer} onAnswer={() => {}} />);
    expect(screen.getByLabelText('Goal: 7')).toBeInTheDocument();
  });
});
