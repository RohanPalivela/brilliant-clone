import type { Course } from '../../types/content';
import { lesson1 } from './lesson1';
import { lesson2 } from './lesson2';
import { lesson3 } from './lesson3';
import { lesson4 } from './lesson4';
import { lesson5 } from './lesson5';
import { lesson6 } from './lesson6';

const lessons = [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6];

export const dynamicProgrammingMastery: Course = {
  id: 'dynamic-programming-mastery',
  title: 'Intro to Dynamic Programming',
  shortDescription:
    'Learn dynamic programming from scratch — solve big problems by reusing answers to smaller ones.',
  description:
    'Dynamic programming (DP) is a way to solve a problem by breaking it into states, solving each one only once, and reusing those answers to build up the final result. A previous understanding of arrays and recursion are necessary before taking this course. This course will teach you the basics of dynamic programming by solving problems such as the staircase problem and the coin change problem.',
  subject: 'computer-science',
  difficulty: 'advanced',
  estimatedMinutes: lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0),
  lessonOrder: lessons.map((l) => l.id),
  lessons,
};
