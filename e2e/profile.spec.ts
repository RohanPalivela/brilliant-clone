import { test, expect } from '@playwright/test';
import { makeUser, signUp, completeLesson1, LESSON1_URL } from './helpers';

test('a learner can restart a course to clear their progress', async ({
  page,
}) => {
  await signUp(page);

  // Build up some progress to reset: finish the first lesson. Wait for the
  // congrats screen so the completion write has fully landed in Firestore
  // before we navigate away (otherwise the reload can abort it mid-flight).
  await page.goto(LESSON1_URL);
  await completeLesson1(page);
  await expect(
    page.getByRole('heading', { name: 'Lesson complete!' }),
  ).toBeVisible();

  // The course page now offers a restart now that there's non-zero progress.
  await page.goto('/courses/dynamic-programming-mastery');
  const restart = page.getByRole('button', { name: 'Restart course' });
  await expect(restart).toBeVisible();

  await restart.click();
  await page.getByRole('button', { name: 'Confirm restart' }).click();

  // Progress is wiped: with nothing left to reset the restart control
  // disappears and the course returns to its untouched "Start course" state.
  await expect(
    page.getByRole('button', { name: 'Restart course' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Start course' }),
  ).toBeVisible();
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
