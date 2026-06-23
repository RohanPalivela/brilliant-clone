import type { Slide, SlideAnswer, CellMark } from '../types/content';
import { computeReachable } from './dp';

/** Initial answer for a slide before the learner interacts. Ground (index 0)
 *  is pre-marked reachable for cell-based widgets. When the slide sets
 *  `prefillUpTo`, cells 0..prefillUpTo arrive solved (and are locked by the
 *  widget) so the learner extends an existing table instead of starting blank. */
export function defaultAnswer(slide: Slide): SlideAnswer {
  switch (slide.component) {
    case 'StairGrid':
    case 'ArrayRow': {
      const marks: CellMark[] = new Array<CellMark>(slide.props.steps + 1).fill(
        'empty',
      );
      marks[0] = 'check';
      const prefillUpTo = slide.props.prefillUpTo ?? 0;
      if (prefillUpTo > 0) {
        const solution = computeReachable(slide.props.steps, slide.props.jumpSizes);
        for (let i = 1; i <= prefillUpTo && i <= slide.props.steps; i++) {
          marks[i] = solution[i] ? 'check' : 'cross';
        }
      }
      return { kind: 'cells', marks };
    }
    case 'RangeSelector':
      return { kind: 'range', indices: [] };
    case 'MultipleChoice':
      return { kind: 'choice', selectedIds: [] };
    case 'CodeBlanks':
      return { kind: 'blanks', filled: {} };
    case 'RichText':
    default:
      return { kind: 'none' };
  }
}

export function nextMark(mark: CellMark): CellMark {
  return mark === 'empty' ? 'check' : mark === 'check' ? 'cross' : 'empty';
}
