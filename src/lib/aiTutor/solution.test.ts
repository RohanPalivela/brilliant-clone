import { describe, it, expect } from 'vitest';
import type { Slide, SlideAnswer } from '../../types/content';
import { computeReachable } from '../dp';
import { validateAnswer } from '../validation';
import { describeSolution, describeAnswer, isActivitySlide } from './solution';

describe('isActivitySlide', () => {
  it('is true for a checkpoint with real validation', () => {
    const s: Slide = {
      id: 'a',
      type: 'checkpoint',
      component: 'StairGrid',
      props: { steps: 11, jumpSizes: [3, 5] },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 11 },
    };
    expect(isActivitySlide(s)).toBe(true);
  });

  it('is false for an explain slide', () => {
    const s: Slide = {
      id: 'b',
      type: 'explain',
      component: 'RichText',
      props: { heading: 'hi' },
      validation: { type: 'none' },
    };
    expect(isActivitySlide(s)).toBe(false);
  });
});

describe('describeSolution ground truth', () => {
  it('reports the exact reachable set computed by dp for a reachability slide', () => {
    const s: Slide = {
      id: 'r',
      type: 'checkpoint',
      component: 'StairGrid',
      props: { steps: 11, jumpSizes: [3, 5], target: 11 },
      validation: { type: 'reachability', jumpSizes: [3, 5], steps: 11, target: 11 },
    };
    const reachable = computeReachable(11, [3, 5]);
    const yes = reachable.map((r, i) => (r ? i : -1)).filter((i) => i >= 0);
    const sol = describeSolution(s);
    expect(sol.isActivity).toBe(true);
    // Every genuinely-reachable step must appear in the summary.
    for (const step of yes) {
      expect(sol.answerSummary).toContain(String(step));
    }
    // Look-backs of 11 are 6 and 8.
    expect(sol.answerSummary).toContain('step 6');
    expect(sol.answerSummary).toContain('step 8');
  });

  it('maps multiple-choice correct ids to their labels', () => {
    const s: Slide = {
      id: 'mc',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question: 'Which?',
        options: [
          { id: 'a', label: 'Option A' },
          { id: 'b', label: 'Option B' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['b'] },
    };
    const sol = describeSolution(s);
    expect(sol.answerSummary).toContain('b');
    expect(sol.answerSummary).toContain('Option B');
  });

  it('produces a coin combination the validator actually accepts', () => {
    const s: Slide = {
      id: 'coin',
      type: 'checkpoint',
      component: 'CoinBuilder',
      props: { coins: [3, 5], target: 11 },
      validation: { type: 'coinSum', coins: [3, 5], target: 11, fewest: true },
    };
    const sol = describeSolution(s);
    // Pull the numbers out of "3 + 3 + 5" and feed them back through validation.
    const picks = (sol.answerSummary.match(/\d+ \+[\d +]+/)?.[0] ?? '')
      .split('+')
      .map((n) => Number(n.trim()))
      .filter((n) => !Number.isNaN(n));
    const answer: SlideAnswer = { kind: 'coins', picks };
    expect(picks.length).toBeGreaterThan(0);
    expect(validateAnswer(s.validation, answer)).toBe(true);
  });

  it('produces a jump path the validator accepts', () => {
    const s: Slide = {
      id: 'jump',
      type: 'checkpoint',
      component: 'PathBuilder',
      props: { jumpSizes: [3, 5], target: 11 },
      validation: { type: 'jumpPath', jumpSizes: [3, 5], target: 11 },
    };
    const sol = describeSolution(s);
    const jumps = (sol.answerSummary.match(/\d+ \+[\d +]+/)?.[0] ?? '')
      .split('+')
      .map((n) => Number(n.trim()))
      .filter((n) => !Number.isNaN(n));
    expect(validateAnswer(s.validation, { kind: 'path', jumps })).toBe(true);
  });

  it('treats explanatory slides as non-activities with no graded answer', () => {
    const s: Slide = {
      id: 'e',
      type: 'explain',
      component: 'RichText',
      props: { heading: 'hi' },
      validation: { type: 'none' },
    };
    const sol = describeSolution(s);
    expect(sol.isActivity).toBe(false);
  });
});

describe('describeAnswer', () => {
  it('summarizes marked cells', () => {
    const a: SlideAnswer = { kind: 'cells', marks: ['check', 'empty', 'cross'] };
    expect(describeAnswer(a)).toContain('0:✓');
    expect(describeAnswer(a)).toContain('2:✗');
  });

  it('reports empty input clearly', () => {
    expect(describeAnswer({ kind: 'choice', selectedIds: [] })).toMatch(/no option/i);
    expect(describeAnswer({ kind: 'none' })).toMatch(/no input/i);
  });

  it('resolves a chosen option id to its on-screen label when given the slide', () => {
    const s: Slide = {
      id: 'mc',
      type: 'prompt',
      component: 'MultipleChoice',
      props: {
        question: 'Which?',
        options: [
          { id: 'a', label: 'Option A' },
          { id: 'b', label: 'Option B' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['a'] },
    };
    const desc = describeAnswer({ kind: 'choice', selectedIds: ['b'] }, s);
    expect(desc).toContain('Option B');
    expect(desc).toContain('id: b');
  });
});
