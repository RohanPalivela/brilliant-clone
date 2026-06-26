import { describe, it, expect } from 'vitest';
import type { Course, Lesson, Slide } from '../../types/content';
import { parseReply, canNavigateToLesson, resolveNavigation } from './navigation';

function slide(id: string): Slide {
  return {
    id,
    type: 'explain',
    component: 'RichText',
    props: { heading: id },
    validation: { type: 'none' },
  };
}

function lesson(id: string, order: number, slideIds: string[]): Lesson {
  return {
    id,
    courseId: 'c',
    title: `Lesson ${order}`,
    order,
    estimatedMinutes: 5,
    slides: slideIds.map(slide),
  };
}

const course: Course = {
  id: 'c',
  title: 'Course',
  shortDescription: 's',
  description: 'd',
  subject: 'computer-science',
  difficulty: 'beginner',
  estimatedMinutes: 15,
  lessonOrder: ['l1', 'l2', 'l3'],
  lessons: [
    lesson('l1', 1, ['l1s1', 'l1s2']),
    lesson('l2', 2, ['l2s1', 'l2s2', 'l2s3']),
    lesson('l3', 3, ['l3s1']),
  ],
};
const current = course.lessons[1]; // l2 (order 2)

describe('parseReply', () => {
  it('returns plain text and no directive when there is no nav block', () => {
    const { text, directive } = parseReply('Try looking back two steps.');
    expect(text).toBe('Try looking back two steps.');
    expect(directive).toBeNull();
  });

  it('strips the tutor-nav block from the visible text and parses it', () => {
    const reply =
      'Let’s revisit that idea.\n```tutor-nav\n{"lessonId":"l1","slideId":"l1s2","reason":"recap"}\n```';
    const { text, directive } = parseReply(reply);
    expect(text).toBe('Let’s revisit that idea.');
    expect(directive).toEqual({
      lessonId: 'l1',
      slideId: 'l1s2',
      reason: 'recap',
      highlight: undefined,
    });
  });

  it('parses an optional highlight phrase', () => {
    const reply =
      '```tutor-nav\n{"lessonId":"l1","slideId":"l1s2","highlight":"look back"}\n```';
    const { directive } = parseReply(reply);
    expect(directive?.highlight).toBe('look back');
  });

  it('treats a malformed nav block as no directive (never throws)', () => {
    const reply = 'See here.\n```tutor-nav\n{not valid json}\n```';
    const { text, directive } = parseReply(reply);
    expect(text).toBe('See here.');
    expect(directive).toBeNull();
  });

  it('tolerates partial directives (missing fields become undefined)', () => {
    const reply = '```tutor-nav\n{"lessonId":"l1"}\n```';
    const { directive } = parseReply(reply);
    expect(directive).toEqual({
      lessonId: 'l1',
      slideId: undefined,
      reason: undefined,
    });
  });
});

describe('canNavigateToLesson', () => {
  it('allows the current lesson and earlier lessons', () => {
    expect(canNavigateToLesson(course, current, 'l1')).toBe(true);
    expect(canNavigateToLesson(course, current, 'l2')).toBe(true);
  });

  it('forbids later (locked) lessons', () => {
    expect(canNavigateToLesson(course, current, 'l3')).toBe(false);
  });

  it('forbids unknown lessons', () => {
    expect(canNavigateToLesson(course, current, 'nope')).toBe(false);
  });
});

// The learner is on the last slide of the current lesson for most cases, so an
// earlier same-lesson slide is a valid "behind them" target.
const HERE = 2;

describe('resolveNavigation (safety boundary)', () => {
  it('resolves a valid earlier-lesson target to a concrete index', () => {
    const target = resolveNavigation(course, current, HERE, {
      lessonId: 'l1',
      slideId: 'l1s2',
      reason: 'recap',
    });
    expect(target).toEqual({
      courseId: 'c',
      lessonId: 'l1',
      slideIndex: 1,
      lessonTitle: 'Lesson 1',
      reason: 'recap',
    });
  });

  it('resolves a same-lesson target the learner has already passed', () => {
    const target = resolveNavigation(course, current, HERE, {
      lessonId: 'l2',
      slideId: 'l2s1',
    });
    expect(target?.slideIndex).toBe(0);
  });

  it('rejects a same-lesson jump to the current step or a later step (no skipping ahead)', () => {
    // Current step itself.
    expect(
      resolveNavigation(course, current, 1, { lessonId: 'l2', slideId: 'l2s2' }),
    ).toBeNull();
    // A step further ahead in this same lesson.
    expect(
      resolveNavigation(course, current, 1, { lessonId: 'l2', slideId: 'l2s3' }),
    ).toBeNull();
  });

  it('carries a highlight that appears verbatim on the destination slide', () => {
    // slide 'l1s1' has heading text 'l1s1', so that phrase is grounded.
    const target = resolveNavigation(course, current, HERE, {
      lessonId: 'l1',
      slideId: 'l1s1',
      highlight: '  l1s1  ',
    });
    expect(target?.highlight).toBe('l1s1');
  });

  it('drops a highlight phrase that is NOT on the destination slide (grounding)', () => {
    const target = resolveNavigation(course, current, HERE, {
      lessonId: 'l1',
      slideId: 'l1s1',
      highlight: 'a sentence the model hallucinated',
    });
    expect(target).not.toBeNull();
    expect(target?.highlight).toBeUndefined();
  });

  it('drops an empty highlight', () => {
    const target = resolveNavigation(course, current, HERE, {
      lessonId: 'l1',
      slideId: 'l1s1',
      highlight: '   ',
    });
    expect(target?.highlight).toBeUndefined();
  });

  it('never throws — malformed input fails in place to null', () => {
    expect(
      resolveNavigation(course, current, HERE, {
        lessonId: 123 as unknown as string,
        slideId: 'l1s1',
      }),
    ).toBeNull();
  });

  it('rejects a forward/locked lesson even if the slide id is valid', () => {
    expect(
      resolveNavigation(course, current, HERE, { lessonId: 'l3', slideId: 'l3s1' }),
    ).toBeNull();
  });

  it('rejects an unknown lesson id', () => {
    expect(
      resolveNavigation(course, current, HERE, { lessonId: 'ghost', slideId: 'x' }),
    ).toBeNull();
  });

  it('rejects an unknown slide id in a valid lesson', () => {
    expect(
      resolveNavigation(course, current, HERE, { lessonId: 'l1', slideId: 'ghost' }),
    ).toBeNull();
  });

  it('rejects null / incomplete directives', () => {
    expect(resolveNavigation(course, current, HERE, null)).toBeNull();
    expect(resolveNavigation(course, current, HERE, { lessonId: 'l1' })).toBeNull();
    expect(resolveNavigation(course, current, HERE, { slideId: 'l1s1' })).toBeNull();
  });
});
