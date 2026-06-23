import { test, expect } from '@playwright/test';
import { signUp, LESSON1_URL } from './helpers';

test('resumes a lesson at the furthest slide reached after reload', async ({
  page,
}) => {
  await signUp(page);
  await page.goto(LESSON1_URL);

  // Advance past the intro and the multiple-choice prompt onto the staircase.
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: /Not reachable/ }).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // We're now on slide 3 (the staircase). Confirm, then wait out the 500ms
  // debounced save before reloading.
  await expect(page.getByText(/Mark every step from 0 to 11/)).toBeVisible();
  await page.waitForTimeout(900);

  await page.reload();

  // The player should resume on the staircase slide, not slide 1.
  await expect(page.getByText(/Mark every step from 0 to 11/)).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'A staircase you climb in jumps' }),
  ).not.toBeVisible();
});
