import { describe, it, expect } from 'vitest';
import { defaultAnswer, nextMark } from './answers';
import type { Slide } from '../types/content';

const base = { id: 's', type: 'prompt' as const };

describe('defaultAnswer', () => {
  it('seeds a StairGrid with only the ground marked', () => {
    const slide: Slide = {
      ...base,
      component: 'StairGrid',
      props: { steps: 11, jumpSizes: [3, 5] },
    };
    const answer = defaultAnswer(slide);
    expect(answer).toEqual({
      kind: 'cells',
      marks: ['check', ...new Array(11).fill('empty')],
    });
  });

  it('prefills + solves a StairGrid up to prefillUpTo', () => {
    const slide: Slide = {
      ...base,
      component: 'ArrayRow',
      props: { steps: 11, jumpSizes: [3, 5], prefillUpTo: 6 },
    };
    const answer = defaultAnswer(slide);
    if (answer.kind !== 'cells') throw new Error('expected cells');
    // 0..6 arrive solved: reachable {0,3,5,6}, not {1,2,4}.
    expect(answer.marks.slice(0, 7)).toEqual([
      'check', // 0
      'cross', // 1
      'cross', // 2
      'check', // 3
      'cross', // 4
      'check', // 5
      'check', // 6
    ]);
    // 7..11 stay empty for the learner to finish.
    expect(answer.marks.slice(7)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
  });

  it('returns an empty range answer for RangeSelector', () => {
    const slide: Slide = {
      ...base,
      component: 'RangeSelector',
      props: { min: 1, max: 7, target: 7, jumpSizes: [2, 3, 4] },
    };
    expect(defaultAnswer(slide)).toEqual({ kind: 'range', indices: [] });
  });

  it('returns an empty choice answer for MultipleChoice', () => {
    const slide: Slide = {
      ...base,
      component: 'MultipleChoice',
      props: { question: 'q', options: [{ id: 'a', label: 'A' }] },
    };
    expect(defaultAnswer(slide)).toEqual({ kind: 'choice', selectedIds: [] });
  });

  it('returns an empty blanks answer for CodeBlanks', () => {
    const slide: Slide = {
      ...base,
      component: 'CodeBlanks',
      props: { codeLines: [], tokens: [] },
    };
    expect(defaultAnswer(slide)).toEqual({ kind: 'blanks', filled: {} });
  });

  it('returns none for RichText', () => {
    const slide: Slide = {
      ...base,
      type: 'explain',
      component: 'RichText',
      props: { heading: 'hi' },
    };
    expect(defaultAnswer(slide)).toEqual({ kind: 'none' });
  });
});

describe('nextMark', () => {
  it('cycles empty -> check -> cross -> empty', () => {
    expect(nextMark('empty')).toBe('check');
    expect(nextMark('check')).toBe('cross');
    expect(nextMark('cross')).toBe('empty');
  });
});
