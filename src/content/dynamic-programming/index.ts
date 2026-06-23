import type { Course } from '../../types/content';
import { lesson1 } from './lesson1';
import { lesson2 } from './lesson2';
import { lesson3 } from './lesson3';
import { lesson4 } from './lesson4';
import { lesson5 } from './lesson5';

const lessons = [lesson1, lesson2, lesson3, lesson4, lesson5];

export const dynamicProgramming: Course = {
  id: 'dynamic-programming',
  title: 'Dynamic Programming',
  shortDescription: 'Build DP intuition from the ground up — no memoization syntax required.',
  description:
    'Build intuition for dynamic programming from the ground up. You’ll explore reachability, state transitions, and tabulation through interactive puzzles — before writing a single memo function.',
  subject: 'computer-science',
  difficulty: 'intermediate',
  estimatedMinutes: lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0),
  lessonOrder: lessons.map((l) => l.id),
  lessons,
};
