import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StairGrid } from './StairGrid';
import { ArrayRow } from './ArrayRow';
import type { SlideAnswer } from '../../types/content';

const empty: SlideAnswer = {
  kind: 'cells',
  marks: ['check', 'empty', 'empty', 'empty'],
};

describe('StairGrid', () => {
  it('renders the learner answer and forwards edits as cells answers', async () => {
    const onAnswer = vi.fn();
    const user = userEvent.setup();
    render(
      <StairGrid
        config={{ steps: 3, jumpSizes: [3, 5], editable: true }}
        answer={empty}
        onAnswer={onAnswer}
      />,
    );
    await user.click(screen.getByLabelText('Step 1, unmarked'));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: 'cells',
      marks: ['check', 'check', 'empty', 'empty'],
    });
  });

  it('renders read-only when not editable', () => {
    render(
      <StairGrid
        config={{ steps: 3, jumpSizes: [3, 5], editable: false }}
        answer={empty}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByLabelText('Step 1, unmarked')).toBeDisabled();
  });

  it('renders the computed solution read-only when showSolution is set', () => {
    render(
      <StairGrid
        config={{ steps: 3, jumpSizes: [3, 5], showSolution: true }}
        answer={{ kind: 'none' }}
        onAnswer={() => {}}
      />,
    );
    // Solution for [3,5]: 0 check, 1 cross, 2 cross, 3 check.
    expect(screen.getByLabelText('Step 1, not reachable')).toBeInTheDocument();
    expect(screen.getByLabelText('Step 3, reachable')).toBeInTheDocument();
  });
});

describe('ArrayRow', () => {
  it('shows the default reachable[] caption', () => {
    render(
      <ArrayRow
        config={{ steps: 2, jumpSizes: [3, 5] }}
        answer={{ kind: 'cells', marks: ['check', 'empty', 'empty'] }}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText('reachable[]')).toBeInTheDocument();
  });

  it('shows a custom caption from config.name', () => {
    render(
      <ArrayRow
        config={{ steps: 2, jumpSizes: [3, 5], name: 'can_make[]' }}
        answer={{ kind: 'cells', marks: ['check', 'empty', 'empty'] }}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText('can_make[]')).toBeInTheDocument();
  });
});
