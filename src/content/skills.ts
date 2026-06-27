// DP pattern taxonomy + the master index of reviewable problems.
//
// The unit the Pattern Review Engine schedules is a *skill* (a DP recurrence
// pattern), not a slide in isolation. Grouping problems by pattern is what makes
// interleaving meaningful and gives the mastery map a DP-shaped story:
// "reachability sweep", "coin change", "recurrence in code", and so on.
//
// Every gradable activity slide across all courses maps to exactly one skill,
// derived from its validation type — so adding a lesson automatically grows the
// review pool with zero extra wiring.

import type { Slide, Validation } from '../types/content';
import type { ReviewSkill } from '../types/review';
import { isActivitySlide } from '../lib/aiTutor/solution';
import { courses, getLesson } from './index';
import { REVIEW_BANK, REVIEW_BANK_LESSON_ID } from './reviewBank';

export const REVIEW_SKILLS: ReviewSkill[] = [
  {
    id: 'path-building',
    name: 'Building paths',
    blurb: 'Stack jumps that land exactly on a target.',
    order: 1,
  },
  {
    id: 'reachability-sweep',
    name: 'Reachability sweeps',
    blurb: 'Mark each step reachable from its look-backs.',
    order: 2,
  },
  {
    id: 'lookback',
    name: 'Look-back dependencies',
    blurb: 'Find the earlier states a cell depends on.',
    order: 3,
  },
  {
    id: 'pattern-reasoning',
    name: 'Spotting the pattern',
    blurb: 'Reason about why the recurrence holds.',
    order: 4,
  },
  {
    id: 'recurrence-code',
    name: 'Recurrence in code',
    blurb: 'Turn the look-back rule into a tabulation loop.',
    order: 5,
  },
  {
    id: 'coin-change',
    name: 'Coin change',
    blurb: 'Build an amount from a smaller solved amount.',
    order: 6,
  },
  {
    id: 'optimal-choice',
    name: 'Optimal first choice',
    blurb: 'Compare 1 + best[amount − coin] across coins.',
    order: 7,
  },
];

const SKILL_BY_ID = new Map(REVIEW_SKILLS.map((s) => [s.id, s]));

/** A validation type names the DP pattern it tests. */
const VALIDATION_SKILL: Record<Validation['type'], string | null> = {
  none: null,
  jumpPath: 'path-building',
  reachability: 'reachability-sweep',
  range: 'lookback',
  multipleChoice: 'pattern-reasoning',
  codeBlanks: 'recurrence-code',
  coinSum: 'coin-change',
  minCoinChoice: 'optimal-choice',
  // Knapsack / take-or-skip is intentionally NOT part of the review curriculum:
  // it (and 2D DP) is never taught in the lessons, so it produces no review items.
  knapsack: null,
};

/** The skill a slide trains, or null if it isn't a gradable activity. */
export function deriveSkillId(slide: Slide): string | null {
  if (!isActivitySlide(slide) || !slide.validation) return null;
  return VALIDATION_SKILL[slide.validation.type] ?? null;
}

export function getSkill(skillId: string): ReviewSkill | undefined {
  return SKILL_BY_ID.get(skillId);
}

/** Stable key for a review item, unique across the whole course catalog. */
export function reviewItemKey(lessonId: string, slideId: string): string {
  return `${lessonId}__${slideId}`;
}

/** A problem that *can* enter the review pool, resolved from bundled content. */
export interface ReviewableRef {
  itemKey: string;
  courseId: string;
  lessonId: string;
  slideId: string;
  skillId: string;
  lessonTitle: string;
  /** Authored difficulty (1–5) read off the slide; defaults to 3 when absent.
   *  Lets a seeder introduce a skill's items in ascending easy→hard order. */
  difficulty: number;
}

/** Bank items attach to the (single) DP course so course resets clear them too. */
const BANK_COURSE_ID = courses[0]?.id ?? 'dynamic-programming-mastery';

/** Fallback difficulty for slides (e.g. lesson checkpoints) that omit one. */
const DEFAULT_DIFFICULTY = 3;

function buildReviewableIndex(): ReviewableRef[] {
  const out: ReviewableRef[] = [];
  for (const course of courses) {
    for (const lesson of course.lessons) {
      for (const slide of lesson.slides) {
        const skillId = deriveSkillId(slide);
        if (!skillId) continue;
        out.push({
          itemKey: reviewItemKey(lesson.id, slide.id),
          courseId: course.id,
          lessonId: lesson.id,
          slideId: slide.id,
          skillId,
          lessonTitle: lesson.title,
          difficulty: slide.difficulty ?? DEFAULT_DIFFICULTY,
        });
      }
    }
  }
  // Standalone bank problems — labelled by pattern, since they have no lesson.
  for (const slide of REVIEW_BANK) {
    const skillId = deriveSkillId(slide);
    if (!skillId) continue;
    out.push({
      itemKey: reviewItemKey(REVIEW_BANK_LESSON_ID, slide.id),
      courseId: BANK_COURSE_ID,
      lessonId: REVIEW_BANK_LESSON_ID,
      slideId: slide.id,
      skillId,
      lessonTitle: `${getSkill(skillId)?.name ?? 'Practice'} · practice`,
      difficulty: slide.difficulty ?? DEFAULT_DIFFICULTY,
    });
  }
  return out;
}

/** Every gradable problem in the catalog, eligible for spaced review. */
export const REVIEWABLE_ITEMS: ReviewableRef[] = buildReviewableIndex();

const REVIEWABLE_BY_KEY = new Map(
  REVIEWABLE_ITEMS.map((r) => [r.itemKey, r]),
);

export function getReviewableRef(itemKey: string): ReviewableRef | undefined {
  return REVIEWABLE_BY_KEY.get(itemKey);
}

const BANK_SLIDE_BY_ID = new Map(REVIEW_BANK.map((s) => [s.id, s]));

/** Resolve the actual slide content behind a review item (lesson or bank). */
export function getReviewSlide(
  courseId: string,
  lessonId: string,
  slideId: string,
): Slide | undefined {
  if (lessonId === REVIEW_BANK_LESSON_ID) return BANK_SLIDE_BY_ID.get(slideId);
  return getLesson(courseId, lessonId)?.lesson.slides.find(
    (s) => s.id === slideId,
  );
}
