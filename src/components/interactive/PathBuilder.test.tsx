import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PathBuilder } from './PathBuilder';
import type { PathBuilderProps, SlideAnswer } from '../../types/content';

const config: PathBuilderProps = { jumpSizes: [3, 7], target: 13 };
const empty: SlideAnswer = { kind: 'path', jumps: [] };

describe('PathBuilder', () => {
  it('appends a jump when a control is tapped', () => {
    const onAnswer = vi.fn();
    render(<PathBuilder config={config} answer={empty} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByLabelText('Jump up 3'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'path', jumps: [3] });
  });

  it('disables a jump that would overshoot the goal', () => {
    // On step 10 (3+7), another +7 would land on 17 > 13.
    render(
      <PathBuilder
        config={config}
        answer={{ kind: 'path', jumps: [3, 7] }}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByLabelText('Jump up 7')).toBeDisabled();
    expect(screen.getByLabelText('Jump up 3')).toBeEnabled();
  });

  it('undoes the most recent jump', () => {
    const onAnswer = vi.fn();
    render(
      <PathBuilder
        config={config}
        answer={{ kind: 'path', jumps: [3, 3] }}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.click(screen.getByLabelText('Undo last jump'));
    expect(onAnswer).toHaveBeenCalledWith({ kind: 'path', jumps: [3] });
  });

  it('celebrates landing on the target exactly', () => {
    render(
      <PathBuilder
        config={config}
        answer={{ kind: 'path', jumps: [3, 3, 7] }}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText(/Landed on 13 exactly/)).toBeInTheDocument();
  });

  it('flags a dead end when no jump can reach the goal', () => {
    // On step 12 (3+3+3+3): +3 = 15, +7 = 19, both overshoot 13.
    render(
      <PathBuilder
        config={config}
        answer={{ kind: 'path', jumps: [3, 3, 3, 3] }}
        onAnswer={() => {}}
      />,
    );
    expect(screen.getByText(/Dead end/)).toBeInTheDocument();
  });
});
