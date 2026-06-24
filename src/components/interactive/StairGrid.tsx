import type {
  StairGridProps,
  ArrayRowProps,
  SlideAnswer,
  CellMark,
} from '../../types/content';
import { computeReachable } from '../../lib/dp';
import { ReachabilityCells } from './ReachabilityCells';

interface Props {
  config: StairGridProps | ArrayRowProps;
  answer: SlideAnswer;
  onAnswer: (answer: SlideAnswer) => void;
  showMistakes?: boolean;
  variant?: 'stairs' | 'array';
}

export function StairGrid({
  config,
  answer,
  onAnswer,
  showMistakes,
  variant = 'stairs',
}: Props) {
  const solution: CellMark[] = computeReachable(
    config.steps,
    config.jumpSizes,
  ).map((r) => (r ? 'check' : 'cross'));

  const marks: CellMark[] = config.showSolution
    ? solution
    : answer.kind === 'cells'
      ? answer.marks
      : new Array<CellMark>(config.steps + 1).fill('empty');

  return (
    <ReachabilityCells
      variant={variant}
      steps={config.steps}
      jumpSizes={config.jumpSizes}
      marks={marks}
      readOnly={!config.editable}
      showMistakes={showMistakes}
      highlightIndices={config.highlightIndices}
      lockedUpTo={config.prefillUpTo ?? 0}
      display={config.display ?? (variant === 'array' ? 'binary' : 'icon')}
      showArrows={config.showArrows}
      arrowTargets={'arrowTargets' in config ? config.arrowTargets : undefined}
      loop={'loop' in config ? config.loop : undefined}
      onChange={(next) => onAnswer({ kind: 'cells', marks: next })}
    />
  );
}
