import { describe, it, expect } from 'vitest';
import {
  courses,
  getCourse,
  getLesson,
  getLessonByIndex,
  firstIncompleteLesson,
  isLessonUnlocked,
} from './index';
import type { Course } from '../types/content';

const dp = courses[0];

describe('course lookups', () => {
  it('finds a course by id and returns undefined for unknown ids', () => {
    expect(getCourse('dynamic-programming')).toBe(dp);
    expect(getCourse('nope')).toBeUndefined();
  });

  it('finds a lesson within a course', () => {
    const found = getLesson('dynamic-programming', 'reach-the-top');
    expect(found?.lesson.title).toBe('Can You Reach the Top?');
    expect(found?.course).toBe(dp);
  });

  it('returns undefined for an unknown lesson or course', () => {
    expect(getLesson('dynamic-programming', 'nope')).toBeUndefined();
    expect(getLesson('nope', 'reach-the-top')).toBeUndefined();
  });

  it('finds a lesson by index', () => {
    expect(getLessonByIndex('dynamic-programming', 0)?.id).toBe('reach-the-top');
    expect(getLessonByIndex('dynamic-programming', 99)).toBeUndefined();
  });
});

describe('firstIncompleteLesson', () => {
  it('returns the first lesson when nothing is complete', () => {
    expect(firstIncompleteLesson(dp, []).id).toBe(dp.lessons[0].id);
  });

  it('skips completed lessons', () => {
    expect(firstIncompleteLesson(dp, [dp.lessons[0].id]).id).toBe(
      dp.lessons[1].id,
    );
  });

  it('returns the last lesson when everything is complete', () => {
    const allIds = dp.lessons.map((l) => l.id);
    expect(firstIncompleteLesson(dp, allIds).id).toBe(
      dp.lessons[dp.lessons.length - 1].id,
    );
  });
});

describe('isLessonUnlocked (sequential gating)', () => {
  it('always unlocks the first lesson', () => {
    expect(isLessonUnlocked(dp, dp.lessons[0].id, [])).toBe(true);
  });

  it('locks a later lesson until the previous one is complete', () => {
    expect(isLessonUnlocked(dp, dp.lessons[1].id, [])).toBe(false);
    expect(isLessonUnlocked(dp, dp.lessons[1].id, [dp.lessons[0].id])).toBe(true);
  });

  it('does not unlock lesson 3 just because lesson 1 is done', () => {
    expect(isLessonUnlocked(dp, dp.lessons[2].id, [dp.lessons[0].id])).toBe(false);
  });
});

// These guard against authored answer keys drifting out of sync with the widget
// props the learner actually interacts with.
describe('content integrity', () => {
  it('every course lessonOrder matches its lessons', () => {
    for (const course of courses) {
      expect(course.lessonOrder).toEqual(course.lessons.map((l) => l.id));
    }
  });

  it('every slide id within a lesson is unique', () => {
    for (const course of courses) {
      for (const lesson of course.lessons) {
        const ids = lesson.slides.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  const allSlides = courses.flatMap((c: Course) =>
    c.lessons.flatMap((l) => l.slides),
  );

  it('reachability validations match their widget props', () => {
    for (const slide of allSlides) {
      if (
        (slide.component === 'StairGrid' || slide.component === 'ArrayRow') &&
        slide.validation?.type === 'reachability'
      ) {
        expect(slide.validation.steps).toBe(slide.props.steps);
        expect(slide.validation.jumpSizes).toEqual(slide.props.jumpSizes);
      }
    }
  });

  it('multipleChoice correct ids reference real, non-empty options', () => {
    for (const slide of allSlides) {
      if (
        slide.component === 'MultipleChoice' &&
        slide.validation?.type === 'multipleChoice'
      ) {
        const optionIds = new Set(slide.props.options.map((o) => o.id));
        expect(slide.validation.correctIds.length).toBeGreaterThan(0);
        for (const id of slide.validation.correctIds) {
          expect(optionIds.has(id)).toBe(true);
        }
      }
    }
  });

  it('range correct indices fall within the selectable window', () => {
    for (const slide of allSlides) {
      if (
        slide.component === 'RangeSelector' &&
        slide.validation?.type === 'range'
      ) {
        const { min, max, goalIndex } = slide.props;
        const selectableMax = goalIndex != null ? goalIndex - 1 : max;
        for (const i of slide.validation.correctIndices) {
          expect(i).toBeGreaterThanOrEqual(min);
          expect(i).toBeLessThanOrEqual(selectableMax);
        }
      }
    }
  });

  it('codeBlanks answers reference real blanks and real tokens', () => {
    for (const slide of allSlides) {
      if (
        slide.component === 'CodeBlanks' &&
        slide.validation?.type === 'codeBlanks'
      ) {
        const blankIds = new Set(
          slide.props.codeLines.flatMap((line) =>
            line.filter((t) => t.type === 'blank').map((t) => t.id),
          ),
        );
        const tokenIds = new Set(slide.props.tokens.map((t) => t.id));
        for (const [blankId, tokenId] of Object.entries(slide.validation.correct)) {
          expect(blankIds.has(blankId)).toBe(true);
          expect(tokenIds.has(tokenId)).toBe(true);
        }
      }
    }
  });
});
