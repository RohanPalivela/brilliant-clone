import { test, expect } from '@playwright/test';
import { signUp, completeLesson1, LESSON1_URL } from './helpers';

test('completing a lesson starts a 1-day streak', async ({ page }) => {
  await signUp(page);
  await page.goto(LESSON1_URL);
  await completeLesson1(page);

  // The congrats screen announces the new streak.
  await expect(page.getByText('1 day streak!')).toBeVisible();

  // And it's reflected in the top nav back on the home page.
  await page.goto('/');
  await expect(page.locator('[title="1 day streak"]')).toBeVisible();
});
