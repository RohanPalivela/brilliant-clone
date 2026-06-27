import { describe, it, expect } from 'vitest';
import { REVIEW_BANK } from './reviewBank';
import {
  REVIEWABLE_ITEMS,
  REVIEW_SKILLS,
  deriveSkillId,
  getReviewSlide,
} from './skills';
import type { Slide, SlideAnswer } from '../types/content';
import { validateAnswer } from '../lib/validation';
import {
  computeReachable,
  minCoinsTable,
  knapsackOptimal,
  UNREACHABLE,
} from '../lib/dp';
import { optimalFirstCoins } from '../lib/validation';

/** Fewest-coin reconstruction off the min-coins table (also a valid exact sum). */
function reconstructCombo(values: number[], target: number): number[] {
  const best = minCoinsTable(values, target);
  if (best[target] === UNREACHABLE) return [];
  const picks: number[] = [];
  let rem = target;
  while (rem > 0) {
    const next = [...values]
      .sort((a, b) => a - b)
      .find((c) => rem - c >= 0 && best[rem - c] === best[rem] - 1);
    if (next === undefined) return [];
    picks.push(next);
    rem -= next;
  }
  return picks;
}

/** Brute-force a knapsack subset that hits the optimum within capacity. */
function knapsackSolution(
  items: { id: string; weight: number; value: number }[],
  capacity: number,
): string[] {
  const optimal = knapsackOptimal(items, capacity);
  const n = items.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    let w = 0;
    let v = 0;
    const ids: string[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        w += items[i].weight;
        v += items[i].value;
        ids.push(items[i].id);
      }
    }
    if (w <= capacity && v === optimal) return ids;
  }
  return [];
}

/** Construct a known-correct answer for any gradable slide, via the DP engine. */
function correctAnswer(slide: Slide): SlideAnswer {
  const v = slide.validation;
  if (!v || v.type === 'none') return { kind: 'none' };
  switch (v.type) {
    case 'reachability': {
      const reachable = computeReachable(v.steps, v.jumpSizes);
      return { kind: 'cells', marks: reachable.map((r) => (r ? 'check' : 'cross')) };
    }
    case 'range':
      return { kind: 'range', indices: v.correctIndices };
    case 'multipleChoice':
      return { kind: 'choice', selectedIds: v.correctIds };
    case 'codeBlanks':
      return { kind: 'blanks', filled: { ...v.correct } };
    case 'coinSum':
      return { kind: 'coins', picks: reconstructCombo(v.coins, v.target) };
    case 'jumpPath':
      return { kind: 'path', jumps: reconstructCombo(v.jumpSizes, v.target) };
    case 'minCoinChoice':
      return {
        kind: 'choice',
        selectedIds: [`c${optimalFirstCoins(v.coins, v.amount)[0]}`],
      };
    case 'knapsack':
      return { kind: 'items', selectedIds: knapsackSolution(v.items, v.capacity) };
    default:
      return { kind: 'none' };
  }
}

describe('review bank content', () => {
  it('has a healthy number of standalone practice problems', () => {
    expect(REVIEW_BANK.length).toBeGreaterThanOrEqual(80);
  });

  it('gives every bank problem a unique slide id', () => {
    const ids = REVIEW_BANK.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('classifies every bank problem as a gradable skill', () => {
    for (const slide of REVIEW_BANK) {
      expect(deriveSkillId(slide), `slide ${slide.id} has no skill`).not.toBeNull();
    }
  });

  it('makes every bank problem solvable (engine accepts the computed answer)', () => {
    for (const slide of REVIEW_BANK) {
      const answer = correctAnswer(slide);
      expect(
        validateAnswer(slide.validation, answer),
        `slide ${slide.id} is not solvable with its computed answer`,
      ).toBe(true);
    }
  });

  it('covers every review DP pattern (knapsack/2D excluded — not taught)', () => {
    const covered = new Set(REVIEWABLE_ITEMS.map((r) => r.skillId));
    for (const skill of REVIEW_SKILLS) {
      expect(covered.has(skill.id), `no items for skill ${skill.id}`).toBe(true);
    }
  });

  it('keeps every reviewable item key unique and resolvable', () => {
    const keys = REVIEWABLE_ITEMS.map((r) => r.itemKey);
    expect(new Set(keys).size).toBe(keys.length);
    for (const ref of REVIEWABLE_ITEMS) {
      const slide = getReviewSlide(ref.courseId, ref.lessonId, ref.slideId);
      expect(slide, `unresolvable item ${ref.itemKey}`).toBeTruthy();
    }
  });

  it('gives every bank slide a difficulty rating in 1..5', () => {
    for (const slide of REVIEW_BANK) {
      const d = slide.difficulty;
      expect(d, `slide ${slide.id} is missing a difficulty`).toBeDefined();
      expect(
        Number.isInteger(d) && (d as number) >= 1 && (d as number) <= 5,
        `slide ${slide.id} has out-of-range difficulty ${d}`,
      ).toBe(true);
    }
  });

  // Group bank slides by skill, preserving REVIEW_BANK encounter order — the
  // same order a seeder reads them in.
  const bankBySkill = (() => {
    const groups = new Map<string, { id: string; difficulty: number }[]>();
    for (const slide of REVIEW_BANK) {
      const skillId = deriveSkillId(slide);
      if (!skillId) continue;
      const list = groups.get(skillId) ?? [];
      list.push({ id: slide.id, difficulty: slide.difficulty ?? 3 });
      groups.set(skillId, list);
    }
    return groups;
  })();

  it('gives every review skill a deep enough bank pool (>= 5 problems)', () => {
    for (const skill of REVIEW_SKILLS) {
      const pool = bankBySkill.get(skill.id) ?? [];
      expect(
        pool.length,
        `skill ${skill.id} has only ${pool.length} bank problems`,
      ).toBeGreaterThanOrEqual(5);
    }
  });

  it('spans at least 2 difficulty levels within each skill', () => {
    for (const skill of REVIEW_SKILLS) {
      const pool = bankBySkill.get(skill.id) ?? [];
      const diffs = pool.map((p) => p.difficulty);
      const span = Math.max(...diffs) - Math.min(...diffs);
      expect(
        span,
        `skill ${skill.id} difficulty range spans only ${span}`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('orders each skill bottom-up: difficulty is non-decreasing in array order', () => {
    for (const skill of REVIEW_SKILLS) {
      const pool = bankBySkill.get(skill.id) ?? [];
      for (let i = 1; i < pool.length; i++) {
        expect(
          pool[i].difficulty,
          `skill ${skill.id} is out of order at ${pool[i].id} ` +
            `(${pool[i - 1].difficulty} then ${pool[i].difficulty})`,
        ).toBeGreaterThanOrEqual(pool[i - 1].difficulty);
      }
    }
  });
});
