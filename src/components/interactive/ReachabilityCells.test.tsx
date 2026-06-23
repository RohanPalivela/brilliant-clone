import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReachabilityCells } from './ReachabilityCells';
import type { CellMark } from '../../types/content';

function marks(...m: CellMark[]): CellMark[] {
  return m;
}

describe('ReachabilityCells', () => {
  it('renders one labeled button per cell', () => {
    render(
      <ReachabilityCells
        variant="stairs"
        steps={3}
        jumpSizes={[3, 5]}
        marks={marks('check', 'empty', 'empty', 'empty')}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Step 0, reachable (start)')).toBeInTheDocument();
    expect(screen.getByLabelText('Step 1, unmarked')).toBeInTheDocument();
    expect(screen.getByLabelText('Step 3, unmarked')).toBeInTheDocument();
  });

  it('cycles a cell empty -> check on tap and emits the new marks', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ReachabilityCells
        variant="stairs"
        steps={3}
        jumpSizes={[3, 5]}
        marks={marks('check', 'empty', 'empty', 'empty')}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText('Step 1, unmarked'));
    expect(onChange).toHaveBeenCalledWith(['check', 'check', 'empty', 'empty']);
  });

  it('toggles a cell with the keyboard (Enter)', () => {
    const onChange = vi.fn();
    render(
      <ReachabilityCells
        variant="array"
        steps={2}
        jumpSizes={[3, 5]}
        marks={marks('check', 'empty', 'empty')}
        onChange={onChange}
      />,
    );
    const cell = screen.getByLabelText('Step 2, unmarked');
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['check', 'empty', 'check']);
  });

  it('does not emit changes when readOnly', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ReachabilityCells
        variant="stairs"
        steps={2}
        jumpSizes={[3, 5]}
        marks={marks('check', 'empty', 'empty')}
        onChange={onChange}
        readOnly
      />,
    );
    const cell = screen.getByLabelText('Step 1, unmarked');
    expect(cell).toBeDisabled();
    await user.click(cell);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('locks cells up to lockedUpTo and labels them as given', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ReachabilityCells
        variant="array"
        steps={4}
        jumpSizes={[3, 5]}
        marks={marks('check', 'cross', 'cross', 'check', 'empty')}
        onChange={onChange}
        lockedUpTo={3}
      />,
    );
    const locked = screen.getByLabelText('Step 2, not reachable (given)');
    expect(locked).toBeDisabled();
    await user.click(locked);
    expect(onChange).not.toHaveBeenCalled();

    // The cell beyond the lock is still editable.
    expect(screen.getByLabelText('Step 4, unmarked')).not.toBeDisabled();
  });

  it('outlines wrong cells when showMistakes is on', () => {
    render(
      <ReachabilityCells
        variant="stairs"
        steps={3}
        jumpSizes={[3, 5]}
        // Step 1 is actually unreachable; marking it check is a mistake.
        marks={marks('check', 'check', 'cross', 'check')}
        onChange={() => {}}
        showMistakes
      />,
    );
    const wrong = screen.getByLabelText('Step 1, reachable');
    expect(wrong.className).toContain('ring-wrong');
    // A correct cell is not outlined.
    const right = screen.getByLabelText('Step 3, reachable');
    expect(right.className).not.toContain('ring-wrong');
  });

  it('persistently highlights cells in highlightIndices', () => {
    render(
      <ReachabilityCells
        variant="stairs"
        steps={3}
        jumpSizes={[3, 5]}
        marks={marks('check', 'empty', 'empty', 'check')}
        onChange={() => {}}
        highlightIndices={[3]}
      />,
    );
    expect(screen.getByLabelText('Step 3, reachable').className).toContain(
      'ring-brand',
    );
  });

  it('renders binary glyphs (1/0) when display is binary', () => {
    render(
      <ReachabilityCells
        variant="array"
        steps={2}
        jumpSizes={[3, 5]}
        marks={marks('check', 'cross', 'empty')}
        onChange={() => {}}
        display="binary"
      />,
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
