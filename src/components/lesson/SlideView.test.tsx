import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SlideView } from './SlideView';
import type { Slide, SlideAnswer } from '../../types/content';

const noop = () => {};
const cellsAnswer: SlideAnswer = {
  kind: 'cells',
  marks: ['check', 'empty', 'empty', 'empty'],
};

function renderSlide(slide: Slide, answer: SlideAnswer = { kind: 'none' }) {
  return render(
    <SlideView slide={slide} answer={answer} onAnswer={noop} showMistakes={false} />,
  );
}

describe('SlideView dispatch', () => {
  it('renders a StairGrid slide with its prompt', () => {
    renderSlide(
      {
        id: 's',
        type: 'checkpoint',
        component: 'StairGrid',
        props: { steps: 3, jumpSizes: [3, 5], editable: true, prompt: 'Mark them' },
      },
      cellsAnswer,
    );
    expect(screen.getByText('Mark them')).toBeInTheDocument();
    expect(screen.getByLabelText('Step 1, unmarked')).toBeInTheDocument();
  });

  it('renders a MultipleChoice slide', () => {
    renderSlide(
      {
        id: 's',
        type: 'prompt',
        component: 'MultipleChoice',
        props: {
          question: 'Reachable?',
          options: [
            { id: 'y', label: 'Yes' },
            { id: 'n', label: 'No' },
          ],
        },
        validation: { type: 'multipleChoice', correctIds: ['n'] },
      },
      { kind: 'choice', selectedIds: [] },
    );
    expect(screen.getByText('Reachable?')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('renders a RangeSelector slide', () => {
    renderSlide(
      {
        id: 's',
        type: 'checkpoint',
        component: 'RangeSelector',
        props: { min: 1, max: 7, target: 7, goalIndex: 7, jumpSizes: [2, 3, 4] },
      },
      { kind: 'range', indices: [3, 4, 5] },
    );
    expect(screen.getByRole('slider', { name: 'Lower bound' })).toBeInTheDocument();
  });

  it('renders a CodeBlanks slide with its solution wired in', () => {
    renderSlide(
      {
        id: 's',
        type: 'checkpoint',
        component: 'CodeBlanks',
        props: {
          codeLines: [
            [
              { type: 'text', value: 'x[' },
              { type: 'blank', id: 'b' },
              { type: 'text', value: ']' },
            ],
          ],
          tokens: [{ id: 'zero', label: '0' }],
        },
        validation: { type: 'codeBlanks', correct: { b: 'zero' } },
      },
      { kind: 'blanks', filled: {} },
    );
    expect(screen.getByLabelText('Empty blank')).toBeInTheDocument();
  });

  it('renders a RichText slide with heading, emphasis, bullets, pseudocode', () => {
    renderSlide({
      id: 's',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'You did DP',
        emphasis: 'Build big from small',
        body: 'Body text',
        bullets: ['first', 'second'],
        pseudocode: 'for i in range(n):',
      },
    });
    expect(screen.getByRole('heading', { name: 'You did DP' })).toBeInTheDocument();
    expect(screen.getByText('Build big from small')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('for i in range(n):')).toBeInTheDocument();
  });

  it('renders a read-only solution grid for a RichText visual', () => {
    renderSlide({
      id: 's',
      type: 'explain',
      component: 'RichText',
      props: {
        heading: 'Reveal',
        visual: { component: 'StairGrid', steps: 3, jumpSizes: [3, 5] },
      },
    });
    // The reveal grid shows the computed solution and is read-only.
    const solvedCell = screen.getByLabelText('Step 3, reachable');
    expect(solvedCell).toBeDisabled();
  });
});
