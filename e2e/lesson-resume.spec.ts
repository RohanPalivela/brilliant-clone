import { test, expect } from '@playwright/test';
import { signUp, LESSON1_URL } from './helpers';

test('resumes a lesson at the furthest slide reached after reload', async ({
  page,
}) => {
  await signUp(page);
  await page.goto(LESSON1_URL);

  // Advance through the five read-only intro slides, answer the MCQ, and land on
  // the guided staircase checkpoint (slide 7).
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Continue' }).click();
  }
  await page.getByRole('radio', { name: /step 4/ }).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // We're now on the guided checkpoint. Confirm, then wait out the 500ms
  // debounced save before reloading.
  await expect(page.getByText(/Let.s warm up together/)).toBeVisible();
  await page.waitForTimeout(900);

  await page.reload();

  // The player should resume on the checkpoint slide, not back at the intro.
  await expect(page.getByText(/Let.s warm up together/)).toBeVisible();
  await expect(
    page.getByText(/You start on the ground/),
  ).not.toBeVisible();
});
