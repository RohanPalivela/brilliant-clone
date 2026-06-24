import { expect, type Page } from '@playwright/test';

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

let counter = 0;

/** A unique account per call so specs never collide in the shared emulator. */
export function makeUser(prefix = 'user'): TestUser {
  counter += 1;
  return {
    name: 'Test Learner',
    email: `${prefix}-${Date.now()}-${counter}@test.dev`,
    password: 'password123',
  };
}

/** Register a fresh account through the UI and land on the home page. */
export async function signUp(page: Page, user = makeUser()): Promise<TestUser> {
  await page.goto('/auth');
  await page.getByRole('button', { name: 'Create an account' }).click();
  await page.getByLabel('Display name').fill(user.name);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(
    page.getByRole('heading', { name: /Good (morning|afternoon|evening)/ }),
  ).toBeVisible();
  return user;
}

const LESSON1_REACHABLE = new Set([0, 3, 5, 6, 8, 9, 10, 11]);

/** Mark steps `from`..`to` (inclusive) on the Lesson 1 staircase (jumps 3,5)
 *  with the correct ✓/✗ for each. Locked/prefilled cells are skipped by the
 *  widget, so callers pass only the range the learner is meant to fill. */
async function fillLesson1Range(page: Page, from: number, to: number): Promise<void> {
  for (let i = from; i <= to; i++) {
    const cell = page.locator(`[data-cell-index="${i}"]`);
    // empty -> check (reachable). Tap again -> cross (unreachable).
    await cell.click();
    if (!LESSON1_REACHABLE.has(i)) await cell.click();
  }
}

/** Fill the full Lesson 1 staircase (steps 1..11) with the correct marks. */
export async function solveLesson1StairGrid(page: Page): Promise<void> {
  await fillLesson1Range(page, 1, 11);
}

/**
 * Play Lesson 1 end-to-end from its first slide to the congrats screen.
 * Assumes the lesson player is already open on slide 1. Mirrors the 11-slide
 * arc: intro → ✓/✗ defs → look backward → walkthrough → subproblem isolation →
 * MCQ → guided checkpoint → solo checkpoint → DPTable → recap → celebrate.
 */
export async function completeLesson1(page: Page): Promise<void> {
  // Slides 1–5 — intro diagram, ✓/✗ definitions, "look backward", the
  // walkthrough stepper, and the subproblem-isolation schematic (all read-only).
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  // Slide 6 — MCQ: which earlier steps decide step 7? (step 4 and step 2)
  await page.getByRole('radio', { name: /step 4/ }).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Slide 7 — guided checkpoint: steps 0..6 are locked; finish 7..11.
  await fillLesson1Range(page, 7, 11);
  await page.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Slide 8 — solo checkpoint: fill the whole staircase (1..11).
  await solveLesson1StairGrid(page);
  await page.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Slide 9 — animated table (DPTable)
  await page.getByRole('button', { name: 'Continue' }).click();

  // Slide 10 — recap (RichText)
  await page.getByRole('button', { name: 'Continue' }).click();

  // Slide 11 — celebrate (RichText) -> finish
  await page.getByRole('button', { name: 'Finish lesson' }).click();
}

export const LESSON1_URL =
  '/courses/dynamic-programming-mastery/lessons/reach-the-top';
