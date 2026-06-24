import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PredecessorPicker } from './PredecessorPicker';
import type { PredecessorPickerProps, SlideAnswer } from '../../types/content';

const config: PredecessorPickerProps = {
  steps: 11,
  jumpSizes: [3, 5],
  target: 9,
  variant: 'array',
};

const empty: SlideAnswer = { kind: 'range', indices: [] };

describe('PredecessorPicker', () => {
  it('selects a predecessor cell on click', () => {
    const onAnswer = vi.fn();
    render(<PredecessorPicker config={config} answer={empty} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByLabelText('Cell 6, not selected'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'range', indices: [6] });
  });

  it('keeps the selected set sorted as more cells are picked', () => {
    const onAnswer = vi.fn();
    render(
      <PredecessorPicker
        config={config}
        answer={{ kind: 'range', indices: [6] }}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.click(screen.getByLabelText('Cell 4, not selected'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'range', indices: [4, 6] });
  });

  it('toggles a chosen cell back off', () => {
    const onAnswer = vi.fn();
    render(
      <PredecessorPicker
        config={config}
        answer={{ kind: 'range', indices: [4, 6] }}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.click(screen.getByLabelText('Cell 6, selected'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'range', indices: [4] });
  });

  it('locks the target cell so it can never be selected', () => {
    render(<PredecessorPicker config={config} answer={empty} onAnswer={() => {}} />);
    expect(
      screen.getByLabelText("Cell 9 — the cell you're deciding"),
    ).toBeDisabled();
  });

  it('renders an array name label and a custom move label', () => {
    render(
      <PredecessorPicker
        config={{
          steps: 11,
          jumpSizes: [3, 5],
          target: 9,
          name: 'can_make[]',
          moveLabel: 'coins',
        }}
        answer={empty}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText('can_make[]')).toBeInTheDocument();
    expect(screen.getByText(/coins 3, 5/)).toBeInTheDocument();
  });

  it('uses "step" wording for the stairs variant', () => {
    render(
      <PredecessorPicker
        config={{ steps: 9, jumpSizes: [2, 3, 4], target: 7, variant: 'stairs' }}
        answer={empty}
        onAnswer={() => {}}
      />,
    );
    expect(
      screen.getByLabelText("Step 7 — the step you're deciding"),
    ).toBeDisabled();
    expect(screen.getByLabelText('Step 3, not selected')).toBeInTheDocument();
  });
});
