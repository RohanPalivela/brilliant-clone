import { test, expect } from '@playwright/test';
import { signUp, completeLesson1, LESSON1_URL } from './helpers';

test('a learner can complete Lesson 1 end to end', async ({ page }) => {
  await signUp(page);
  await page.goto(LESSON1_URL);

  // The player opens on the intro slide; the lesson title is in the header bar.
  await expect(page.getByText('The Staircase Problem')).toBeVisible();

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

  // Advance through the five read-only intro slides to the MCQ.
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Continue' }).click();
  }
  // Answer the MCQ correctly, then advance to the guided staircase checkpoint.
  await page.getByRole('radio', { name: /step 4/ }).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Steps 0..6 are locked correct. Mark step 7 (a dead end) as reachable —
  // that's wrong — and check.
  await page.locator('[data-cell-index="7"]').click();
  await page.getByRole('button', { name: 'Check' }).click();

  // Still gated on the checkpoint: the Check button remains.
  await expect(page.getByRole('button', { name: 'Check' })).toBeVisible();
});
