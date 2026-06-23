import { test, expect } from '@playwright/test';
import { signUp, completeLesson1, LESSON1_URL } from './helpers';

test('a learner can complete Lesson 1 end to end', async ({ page }) => {
  await signUp(page);
  await page.goto(LESSON1_URL);

  // The player opens on the intro slide.
  await expect(
    page.getByRole('heading', { name: 'A staircase you climb in jumps' }),
  ).toBeVisible();

  await completeLesson1(page);

  // Congrats screen with course progress advanced.
  await expect(
    page.getByRole('heading', { name: 'Lesson complete!' }),
  ).toBeVisible();
  await expect(page.getByText('20%')).toBeVisible(); // 1 of 5 lessons
  await expect(page.getByRole('button', { name: 'Next lesson' })).toBeVisible();
});

test('a wrong staircase keeps the learner on the checkpoint', async ({ page }) => {
  await signUp(page);
  await page.goto(LESSON1_URL);

  // Advance to the staircase checkpoint.
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: /Not reachable/ }).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Mark only step 1 (which is actually a dead-end) and check — this is wrong.
  await page.locator('[data-cell-index="1"]').click();
  await page.getByRole('button', { name: 'Check' }).click();

  await expect(page.getByText(/Start at step 0/)).toBeVisible();
  // Still gated: no Continue button yet.
  await expect(
    page.getByRole('button', { name: 'Check' }),
  ).toBeVisible();
});
