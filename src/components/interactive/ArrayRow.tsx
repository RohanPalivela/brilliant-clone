import type { ArrayRowProps, SlideAnswer } from '../../types/content';
import { StairGrid } from './StairGrid';

interface Props {
  config: ArrayRowProps;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  showMistakes?: boolean;
}

// The array is the staircase lying down — same logic, "array" visual variant.
export function ArrayRow({ config, answer, onAnswer, showMistakes }: Props) {
  return (
    <div>
      <div className="mb-2 text-center text-xs font-medium tracking-wide text-muted">
        {config.name ?? 'reachable[]'}
      </div>
      <StairGrid
        config={config}
        answer={answer}
        onAnswer={onAnswer}
        showMistakes={showMistakes}
        variant="array"
      />
    </div>
  );
}
