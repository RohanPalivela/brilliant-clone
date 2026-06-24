import { test, expect } from '@playwright/test';
import { signUp, completeLesson1, LESSON1_URL } from './helpers';

const COURSE_URL = '/courses/dynamic-programming-mastery';

test('lesson 2 is locked until lesson 1 is completed', async ({ page }) => {
  await signUp(page);
  await page.goto(COURSE_URL);

  const lessonButtons = page.locator('ol li button');
  // Lesson 1 is always unlocked; lesson 2 starts locked (disabled).
  await expect(lessonButtons.nth(0)).toBeEnabled();
  await expect(lessonButtons.nth(1)).toBeDisabled();

  // Complete lesson 1.
  await page.goto(LESSON1_URL);
  await completeLesson1(page);
  await expect(
    page.getByRole('heading', { name: 'Lesson complete!' }),
  ).toBeVisible();

  // Back on the course page, lesson 2 is now unlocked.
  await page.goto(COURSE_URL);
  await expect(page.getByText('1 of 7 lessons completed')).toBeVisible();
  await expect(page.locator('ol li button').nth(1)).toBeEnabled();
});
