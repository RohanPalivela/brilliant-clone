import { describe, it, expect } from 'vitest';
import type { Course, Lesson, Slide } from '../../types/content';
import {
  buildReachableSlides,
  buildUpcomingLessons,
  buildTutorContext,
  buildSystemPrompt,
} from './context';

function slide(id: string, over: Partial<Slide> = {}): Slide {
  return {
    id,
    type: 'explain',
    component: 'RichText',
    props: { heading: id },
    validation: { type: 'none' },
    ...over,
  } as Slide;
}

const lessonA: Lesson = {
  id: 'l1',
  courseId: 'c',
  title: 'Staircase',
  order: 1,
  estimatedMinutes: 5,
  slides: [slide('l1s1'), slide('l1s2')],
};
const lessonB: Lesson = {
  id: 'l2',
  courseId: 'c',
  title: 'Arrays',
  order: 2,
  estimatedMinutes: 5,
  slides: [
    slide('l2s1'),
    {
      id: 'l2s2',
      type: 'checkpoint',
      component: 'MultipleChoice',
      props: {
        question: 'Which steps decide step 7?',
        options: [
          { id: 'x', label: '4 and 2' },
          { id: 'y', label: '3 and 5' },
        ],
      },
      validation: { type: 'multipleChoice', correctIds: ['x'] },
    },
  ],
};
const lessonC: Lesson = {
  id: 'l3',
  courseId: 'c',
  title: 'Later',
  order: 3,
  estimatedMinutes: 5,
  slides: [slide('l3s1')],
};

const course: Course = {
  id: 'c',
  title: 'DP',
  shortDescription: 's',
  description: 'd',
  subject: 'computer-science',
  difficulty: 'beginner',
  estimatedMinutes: 15,
  lessonOrder: ['l1', 'l2', 'l3'],
  lessons: [lessonA, lessonB, lessonC],
};

describe('buildReachableSlides', () => {
  it('includes earlier lessons and already-passed steps, but excludes later (locked) ones', () => {
    // Learner is on slide index 1 of lessonB, so l2s1 (index 0) is behind them.
    const reachable = buildReachableSlides(course, lessonB, 1);
    const lessonIds = new Set(reachable.map((s) => s.lessonId));
    expect(lessonIds.has('l1')).toBe(true);
    expect(lessonIds.has('l2')).toBe(true);
    expect(lessonIds.has('l3')).toBe(false);
  });

  it('excludes the current step and any later step in the current lesson (no skipping ahead)', () => {
    const reachable = buildReachableSlides(course, lessonB, 0);
    const ids = reachable.map((s) => s.slideId);
    // On the very first step of lessonB, no slide in lessonB is "behind" yet…
    expect(ids).not.toContain('l2s1');
    expect(ids).not.toContain('l2s2');
    // …but earlier lessons remain reachable for review.
    expect(ids).toContain('l1s1');
    expect(ids).toContain('l1s2');
  });
});

describe('buildUpcomingLessons', () => {
  it('lists later (locked) lessons by title only, never the current/earlier ones', () => {
    const upcoming = buildUpcomingLessons(course, lessonB);
    expect(upcoming).toEqual([{ lessonOrder: 3, lessonTitle: 'Later' }]);
  });

  it('is empty when the learner is on the final lesson', () => {
    expect(buildUpcomingLessons(course, lessonC)).toEqual([]);
  });
});

describe('buildSystemPrompt', () => {
  it('embeds the safeguards and ground truth, and bans giving the answer on an activity', () => {
    const ctx = buildTutorContext(course, lessonB, 1, { kind: 'choice', selectedIds: [] }, false);
    const prompt = buildSystemPrompt(ctx);

    // Safeguards present.
    expect(prompt).toMatch(/never reveal/i);
    expect(prompt).toMatch(/ignore previous instructions/i);
    expect(prompt).toMatch(/GRADED ACTIVITY/);
    expect(prompt).toMatch(/NEVER give the correct\/final answer/i);

    // Ground truth present (so coaching is accurate) — the correct option id.
    expect(prompt).toContain('x');

    // Navigation list only references allowed slides, never the locked lesson.
    expect(prompt).toContain('lessonId="l1"');
    expect(prompt).not.toContain('l3s1');
  });

  it('treats earlier lessons as on-topic and includes their content to reference', () => {
    const ctx = buildTutorContext(course, lessonB, 1, { kind: 'choice', selectedIds: [] }, false);
    const prompt = buildSystemPrompt(ctx);

    // Foundational/earlier-lesson questions are explicitly on-topic.
    expect(prompt).toMatch(/earlier lesson/i);
    expect(prompt).toMatch(/ON-topic/);
    // The reference list now carries the actual slide content, not just labels.
    expect(prompt).toMatch(/content:/);
  });

  it('treats future-lesson topics as on-topic, teasing them by title without leaking content', () => {
    const ctx = buildTutorContext(course, lessonB, 0, { kind: 'none' }, false);
    const prompt = buildSystemPrompt(ctx);

    // Future topics are explicitly on-topic and must not be refused.
    expect(prompt).toMatch(/FUTURE TOPICS ARE ALSO ON-TOPIC/);
    expect(prompt).toMatch(/Coming later in this course/);
    // The upcoming lesson is named by title only…
    expect(prompt).toContain('Lesson 3: "Later"');
    // …but its slide content/ids are still never exposed.
    expect(prompt).not.toContain('l3s1');
  });

  it('marks the final lesson as having nothing coming later', () => {
    const ctx = buildTutorContext(course, lessonC, 0, { kind: 'none' }, false);
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toMatch(/this is the final lesson/);
  });

  it('lets the tutor repeat the learner their own input but not the gated answer', () => {
    const ctx = buildTutorContext(course, lessonB, 1, { kind: 'choice', selectedIds: ['y'] }, false);
    const prompt = buildSystemPrompt(ctx);

    // Rule allowing the learner's own choice to be shared.
    expect(prompt).toMatch(/OWN current input/);
    expect(prompt).toMatch(/belongs to them/i);
    // The learner's selection is rendered with its human label, not just the id.
    expect(prompt).toContain('3 and 5');
  });

  it('uses the explanatory rule (not the activity ban) on a non-graded slide', () => {
    const ctx = buildTutorContext(course, lessonA, 0, { kind: 'none' }, false);
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toMatch(/explanatory \(not graded\)/i);
    expect(prompt).not.toMatch(/NEVER give the correct\/final answer/i);
  });

  it('reports the learner current input so the tutor is grounded', () => {
    const ctx = buildTutorContext(course, lessonB, 1, { kind: 'choice', selectedIds: ['y'] }, false);
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toMatch(/current input/i);
    expect(prompt).toContain('y');
  });

  it('frames learner input as untrusted data fenced by the request nonce', () => {
    const ctx = buildTutorContext(course, lessonA, 0, { kind: 'none' }, false);
    const prompt = buildSystemPrompt(ctx, 'NONCE123');
    expect(prompt).toContain('NONCE123');
    expect(prompt).toMatch(/untrusted DATA/);
    expect(prompt).toMatch(/never instructions/i);
    expect(prompt).toMatch(/cannot be altered, disabled, or overridden/i);
  });

  it('still asserts the rules cannot be overridden without a nonce', () => {
    const ctx = buildTutorContext(course, lessonA, 0, { kind: 'none' }, false);
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toMatch(/cannot be altered, disabled, or overridden/i);
  });
});
