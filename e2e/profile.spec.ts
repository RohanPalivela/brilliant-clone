import { test, expect } from '@playwright/test';
import { makeUser, signUp, completeLesson1, LESSON1_URL } from './helpers';

test('a learner can restart a course to clear their progress', async ({
  page,
}) => {
  await signUp(page);

  // Build up some progress to reset: finish the first lesson.
  await page.goto(LESSON1_URL);
  await completeLesson1(page);

  // The profile shows the course as in progress and offers a restart.
  await page.goto('/profile');
  await expect(page.getByText(/% through\./)).toBeVisible();
  const restart = page.getByRole('button', { name: 'Restart course' });
  await expect(restart).toBeEnabled();

  await restart.click();
  await page.getByRole('button', { name: 'Confirm restart' }).click();

  // Progress is wiped: the copy flips back to the untouched state and the
  // restart button disables because there's nothing left to reset.
  await expect(
    page.getByText("You haven't started this course yet."),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Restart course' }),
  ).toBeDisabled();
});

test('a learner can delete their profile and cannot sign back in', async ({
  page,
}) => {
  const user = makeUser('deletable');
  await signUp(page, user);

  await page.goto('/profile');
  await page.getByRole('button', { name: 'Delete profile' }).click();
  await page.getByRole('button', { name: 'Yes, delete my profile' }).click();

  // Deleting the account ends the session and bounces to the auth page.
  await expect(page).toHaveURL(/\/auth$/);

  // The account is truly gone from Firebase: the old credentials no longer
  // authenticate, so signing in surfaces the invalid-credentials error.
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByText(/don.t match|Something went wrong/),
  ).toBeVisible();
});
