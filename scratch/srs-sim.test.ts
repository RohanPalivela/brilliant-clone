// SRS scheduler simulation harness.
//
// This is NOT a unit test of expected behavior — it is an instrumentation
// run that drives the REAL scheduler from src/lib/srs.ts through a learner's
// ~60 simulated days and prints measured numbers for analysis. It lives under
// scratch/ and modifies nothing in src/. Run with: `npm test scratch/srs-sim`.
//
// Each `it` block prints a labeled table. The asserts only guard against the
// sim itself silently breaking; the findings live in the console output.

import { describe, it, expect } from 'vitest';
import {
  DAY_MS,
  initialSchedule,
  newItemSchedule,
  scheduleNext,
  gradeOutcome,
  itemStrength,
  levelFromStrength,
  summarizeMastery,
  interleave,
} from '../src/lib/srs';
import type { Grade, ReviewItem, SrsState } from '../src/types/review';
import { REVIEWABLE_ITEMS, reviewItemKey } from '../src/content/skills';
import { REVIEW_BANK_LESSON_ID } from '../src/content/reviewBank';

// --- tiny helpers ---------------------------------------------------------

const T0 = 1_700_000_000_000; // fixed epoch so every run is comparable
const day = (n: number) => T0 + n * DAY_MS;

/** Build a full ReviewItem from scheduler state for the mastery aggregators. */
function makeItem(
  skillId: string,
  state: SrsState,
  overrides: Partial<ReviewItem> = {},
): ReviewItem {
  return {
    itemKey: overrides.itemKey ?? `${skillId}-${Math.random().toString(36).slice(2)}`,
    courseId: 'c',
    lessonId: 'l',
    slideId: 's',
    skillId,
    ease: state.ease,
    intervalDays: state.intervalDays,
    reps: state.reps,
    lapses: state.lapses,
    dueAt: state.dueAt,
    lastReviewedAt: state.lastReviewedAt,
    lastResult: null,
    attempts: 0,
    correctCount: 0,
    createdAt: T0,
    ...overrides,
  };
}

const skill = (id: string, order: number) => ({
  id,
  name: id,
  blurb: '',
  order,
});

function pad(s: string | number, w: number) {
  const str = String(s);
  return str.length >= w ? str : str + ' '.repeat(w - str.length);
}
function padL(s: string | number, w: number) {
  const str = String(s);
  return str.length >= w ? str : ' '.repeat(w - str.length) + str;
}
function table(headers: string[], rows: (string | number)[][], widths: number[]) {
  const line = headers.map((h, i) => pad(h, widths[i])).join(' | ');
  const sep = widths.map((w) => '-'.repeat(w)).join('-+-');
  const body = rows
    .map((r) => r.map((c, i) => pad(c, widths[i])).join(' | '))
    .join('\n');
  return `${line}\n${sep}\n${body}`;
}

/** Real per-skill bank size (only the standalone review-bank items). */
function bankSizeBySkill(): Map<string, number> {
  const m = new Map<string, number>();
  for (const ref of REVIEWABLE_ITEMS) {
    if (ref.lessonId !== REVIEW_BANK_LESSON_ID) continue;
    m.set(ref.skillId, (m.get(ref.skillId) ?? 0) + 1);
  }
  return m;
}

// =========================================================================
describe('SRS simulation', () => {
  // -----------------------------------------------------------------------
  it('Scenario 1: diligent learner, always "good"', () => {
    // One freshly-learned item, reviewed exactly when due, always recalled clean.
    let state: SrsState = initialSchedule(day(0));
    const rows: (string | number)[][] = [];
    rows.push([0, 'enroll', state.intervalDays, state.reps, state.ease.toFixed(2), Math.round((state.dueAt - T0) / DAY_MS)]);

    let reviews = 0;
    let masteredOnDay: number | null = null;
    const grade: Grade = 'good';
    for (let d = 1; d <= 60; d++) {
      if (state.dueAt <= day(d)) {
        state = scheduleNext(state, grade, day(d));
        reviews++;
        rows.push([
          d,
          grade,
          state.intervalDays,
          state.reps,
          state.ease.toFixed(2),
          Math.round((state.dueAt - T0) / DAY_MS),
        ]);
        if (masteredOnDay === null && state.intervalDays >= 21) masteredOnDay = d;
      }
    }

    console.log('\n=== Scenario 1: Diligent learner (always good) ===');
    console.log(
      table(
        ['day', 'action', 'interval', 'reps', 'ease', 'nextDue(day)'],
        rows,
        [4, 7, 8, 4, 5, 12],
      ),
    );
    console.log(
      `interval growth: ${rows.map((r) => r[2]).join(' -> ')}`,
    );
    console.log(`total reviews in 60 days: ${reviews}`);
    console.log(`days-to-mastered (interval>=21): day ${masteredOnDay}`);
    console.log(
      `final strength: ${itemStrength(state as ReviewItem).toFixed(2)} (${levelFromStrength(itemStrength(state as ReviewItem))})`,
    );

    expect(masteredOnDay).not.toBeNull();
    expect(reviews).toBeLessThan(10); // a single item should NOT generate daily work
  });

  // -----------------------------------------------------------------------
  it('Scenario 2: flooding — seed a whole skill bank on one demo', () => {
    const sizes = bankSizeBySkill();
    console.log('\n=== Scenario 2: Bank flood ===');
    console.log('Per-skill bank sizes (items seeded on first demo of skill):');
    console.log(
      table(
        ['skillId', 'bankItems'],
        [...sizes.entries()].map(([k, v]) => [k, v]),
        [22, 9],
      ),
    );

    // Pick the largest bank to stress the daily load the most.
    const [biggestSkill, biggestSize] = [...sizes.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];

    // Seed exactly as enrollSkillBank does: offsetDays = index i.
    type S = SrsState & { id: number };
    let items: S[] = Array.from({ length: biggestSize }, (_, i) => ({
      ...newItemSchedule(day(0), i),
      id: i,
    }));

    // (a) DILIGENT: learner clears all due items every day with 'good'.
    const rowsCleared: (string | number)[][] = [];
    // (b) BACKLOG: learner never reviews — pure "new" trickle accumulates.
    const backlog: number[] = [];

    // backlog snapshot (no reviews)
    for (let d = 0; d <= 14; d++) {
      const due = items.filter((it) => it.dueAt <= day(d)).length;
      backlog.push(due);
    }

    // diligent path mutates a fresh copy
    items = Array.from({ length: biggestSize }, (_, i) => ({
      ...newItemSchedule(day(0), i),
      id: i,
    }));
    for (let d = 0; d <= 14; d++) {
      const dueToday = items.filter((it) => it.dueAt <= day(d));
      const newDue = dueToday.filter((it) => it.reps === 0).length;
      const returningDue = dueToday.length - newDue;
      rowsCleared.push([d, dueToday.length, newDue, returningDue]);
      // clear them
      for (const it of dueToday) {
        const next = scheduleNext(it, 'good', day(d));
        Object.assign(it, next);
      }
    }

    console.log(
      `\nBiggest bank: "${biggestSkill}" = ${biggestSize} items, seeded offsetDays = 0..${biggestSize - 1}`,
    );
    console.log('\nIf learner NEVER reviews (raw backlog of due items):');
    console.log(
      table(
        ['day', 'cumulativeDue'],
        backlog.map((v, i) => [i, v]),
        [4, 14],
      ),
    );
    console.log('\nIf learner CLEARS all due every day with "good":');
    console.log(
      table(
        ['day', 'dueLoad', 'newSeeds', 'returningReviews'],
        rowsCleared,
        [4, 8, 9, 17],
      ),
    );
    const peak = Math.max(...rowsCleared.map((r) => Number(r[1])));
    console.log(`peak daily due-load while clearing: ${peak} items/day`);

    // (c) COMPOUNDING: a single study session can demo MANY skills (one lesson
    // touches several validation types), each firing enrollSkillBank — and every
    // bank restarts offsetDays at 0, so item0 of every seeded skill is due the
    // SAME day. Simulate seeding ALL skill banks on day 0, learner clears daily.
    type S2 = SrsState & { id: string };
    let all: S2[] = [];
    for (const [sk, n] of sizes.entries()) {
      for (let i = 0; i < n; i++) {
        all.push({ ...newItemSchedule(day(0), i), id: `${sk}-${i}` });
      }
    }
    const totalSeeded = all.length;
    const rowsAll: (string | number)[][] = [];
    for (let d = 0; d <= 14; d++) {
      const dueToday = all.filter((it) => it.dueAt <= day(d));
      const newDue = dueToday.filter((it) => it.reps === 0).length;
      rowsAll.push([d, dueToday.length, newDue, dueToday.length - newDue]);
      for (const it of dueToday) Object.assign(it, scheduleNext(it, 'good', day(d)));
    }
    console.log(
      `\nIf learner demos ALL ${sizes.size} skills on day 0 (${totalSeeded} items seeded) and clears daily:`,
    );
    console.log(
      table(
        ['day', 'dueLoad', 'newSeeds', 'returningReviews'],
        rowsAll,
        [4, 8, 9, 17],
      ),
    );
    console.log(
      `peak daily due-load (all-skill flood): ${Math.max(...rowsAll.map((r) => Number(r[1])))} items/day`,
    );

    expect(biggestSize).toBeGreaterThan(0);
  });

  // -----------------------------------------------------------------------
  it('Scenario 3: forgetful learner — alternating good/again', () => {
    let state: SrsState = initialSchedule(day(0));
    const rows: (string | number)[][] = [];
    let easeFloorAtReview: number | null = null;
    let clock = 0;
    for (let r = 0; r < 24; r++) {
      const grade: Grade = r % 2 === 0 ? 'good' : 'again';
      clock += Math.max(1, state.intervalDays);
      state = scheduleNext(state, grade, day(clock));
      rows.push([
        r + 1,
        grade,
        state.intervalDays,
        state.reps,
        state.lapses,
        state.ease.toFixed(2),
      ]);
      if (easeFloorAtReview === null && state.ease <= 1.3) easeFloorAtReview = r + 1;
    }
    console.log('\n=== Scenario 3: Forgetful learner (good/again alternating) ===');
    console.log(
      table(
        ['review', 'grade', 'interval', 'reps', 'lapses', 'ease'],
        rows,
        [6, 6, 8, 4, 6, 5],
      ),
    );
    console.log(`ease hit 1.3 floor at review #${easeFloorAtReview}`);
    console.log(
      `max interval ever reached: ${Math.max(...rows.map((r) => Number(r[2])))} days`,
    );
    console.log(
      `final: interval=${state.intervalDays}d, lapses=${state.lapses}, ease=${state.ease}, strength=${itemStrength(state as ReviewItem).toFixed(2)}`,
    );

    expect(state.ease).toBe(1.3);
  });

  // -----------------------------------------------------------------------
  it('Scenario 4: mastery honesty — overdue but still "mastered"', () => {
    // Drive an item to interval >= 21 with clean recalls.
    let state: SrsState = initialSchedule(day(0));
    let d = 0;
    while (state.intervalDays < 21) {
      d += state.intervalDays;
      state = scheduleNext(state, 'good', day(d));
    }
    const masteredDay = d;
    const sBefore = itemStrength(state as ReviewItem);

    // Advance the clock 100 days WITHOUT reviewing.
    const now = day(masteredDay + 100);
    const sAfter = itemStrength(state as ReviewItem); // strength ignores time
    const overdueDays = Math.round((now - state.dueAt) / DAY_MS);

    console.log('\n=== Scenario 4: Mastery honesty (no decay over time) ===');
    console.log(
      `item reached interval=${state.intervalDays}d on day ${masteredDay}, dueAt=day ${Math.round((state.dueAt - T0) / DAY_MS)}`,
    );
    console.log(
      `strength at mastery:      ${sBefore.toFixed(2)} -> ${levelFromStrength(sBefore)}`,
    );
    console.log(
      `100 days later (overdue by ${overdueDays} days, never reviewed):`,
    );
    console.log(
      `strength now:             ${sAfter.toFixed(2)} -> ${levelFromStrength(sAfter)}`,
    );
    console.log(
      `itemStrength inputs are {intervalDays, reps} only — dueAt/now are ignored.`,
    );

    expect(levelFromStrength(sAfter)).toBe('mastered');
    expect(overdueDays).toBeGreaterThan(50);
  });

  // -----------------------------------------------------------------------
  it('Scenario 5: mastery dip when a bank is enrolled', () => {
    const skills = [skill('coin-change', 1)];
    // One strong/mastered item.
    const strong = makeItem('coin-change', {
      ease: 2.4,
      intervalDays: 41,
      reps: 5,
      lapses: 0,
      dueAt: day(50),
      lastReviewedAt: day(9),
    });

    const before = summarizeMastery([strong], skills, day(0))[0];

    // Now seed 8 new bank items (reps=0, interval=0 => strength 0).
    const seeded = Array.from({ length: 8 }, (_, i) =>
      makeItem('coin-change', { ...newItemSchedule(day(0), i) }),
    );
    const after = summarizeMastery([strong, ...seeded], skills, day(0))[0];

    console.log('\n=== Scenario 5: Mastery dip on enrollment ===');
    console.log(
      table(
        ['phase', 'items', 'strength%', 'level'],
        [
          ['before', before.total, (before.strength * 100).toFixed(1), before.level],
          ['after seed', after.total, (after.strength * 100).toFixed(1), after.level],
        ],
        [12, 6, 10, 10],
      ),
    );
    console.log(
      `enrolling 8 fresh variants dropped displayed mastery from ${(before.strength * 100).toFixed(0)}% (${before.level}) to ${(after.strength * 100).toFixed(0)}% (${after.level}).`,
    );

    expect(after.strength).toBeLessThan(before.strength);
  });

  // -----------------------------------------------------------------------
  it('Scenario 6: interleave determinism & same-skill runs', () => {
    // Realistic due set: several skills with uneven counts.
    const counts: Record<string, number> = {
      'coin-change': 6,
      'reachability-sweep': 4,
      lookback: 3,
      'path-building': 2,
      'optimal-choice': 1,
      'recurrence-code': 4,
    };
    const dueSet: ReviewItem[] = [];
    let k = 0;
    for (const [sk, n] of Object.entries(counts)) {
      for (let i = 0; i < n; i++) {
        dueSet.push(
          makeItem(sk, { ...newItemSchedule(day(-i - 1), 0) }, {
            itemKey: `${sk}-${i}`,
          }),
        );
        k++;
      }
    }

    const RUNS = 2000;
    const maxRunDist = new Map<number, number>();
    const orderings = new Set<string>();
    let totalAdjacentSameSkill = 0;
    for (let r = 0; r < RUNS; r++) {
      const out = interleave(dueSet);
      orderings.add(out.map((i) => i.itemKey).join(','));
      let maxRun = 1;
      let cur = 1;
      for (let i = 1; i < out.length; i++) {
        if (out[i].skillId === out[i - 1].skillId) {
          cur++;
          totalAdjacentSameSkill++;
        } else {
          cur = 1;
        }
        if (cur > maxRun) maxRun = cur;
      }
      maxRunDist.set(maxRun, (maxRunDist.get(maxRun) ?? 0) + 1);
    }

    console.log('\n=== Scenario 6: Interleave determinism & quality ===');
    console.log(
      `due set: ${dueSet.length} items across ${Object.keys(counts).length} skills (${JSON.stringify(counts)})`,
    );
    console.log(
      table(
        ['maxSameSkillRun', 'runsWithThisMax', 'pctOfRuns'],
        [...maxRunDist.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([run, n]) => [run, n, ((n / RUNS) * 100).toFixed(1) + '%']),
        [16, 16, 10],
      ),
    );
    console.log(
      `distinct orderings across ${RUNS} runs: ${orderings.size} (1 = deterministic)`,
    );
    console.log(
      `avg adjacent same-skill pairs per run: ${(totalAdjacentSameSkill / RUNS).toFixed(2)} (ideal 0)`,
    );

    expect(orderings.size).toBeGreaterThan(1); // confirms it is randomized
  });
});
