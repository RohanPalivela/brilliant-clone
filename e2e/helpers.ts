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

/** Fill the Lesson 1 staircase (jumps 3,5 / 11) with the correct marks. */
export async function solveLesson1StairGrid(page: Page): Promise<void> {
  for (let i = 1; i <= 11; i++) {
    const cell = page.locator(`[data-cell-index="${i}"]`);
    // empty -> check (reachable). Tap again -> cross (unreachable).
    await cell.click();
    if (!LESSON1_REACHABLE.has(i)) await cell.click();
  }
}

/**
 * Play Lesson 1 end-to-end from its first slide to the congrats screen.
 * Assumes the lesson player is already open on slide 1.
 */
export async function completeLesson1(page: Page): Promise<void> {
  // Slide 1 — intro (RichText)
  await page.getByRole('button', { name: 'Continue' }).click();

  // Slide 2 — multiple choice (step 7 is not reachable)
  await page.getByRole('radio', { name: /Not reachable/ }).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Slide 3 — fill the full staircase
  await solveLesson1StairGrid(page);
  await page.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Slide 4 — reveal (RichText)
  await page.getByRole('button', { name: 'Continue' }).click();

  // Slide 5 — celebrate (RichText) -> finish
  await page.getByRole('button', { name: 'Finish lesson' }).click();
}

export const LESSON1_URL =
  '/courses/dynamic-programming/lessons/reach-the-top';
