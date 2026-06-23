import { test, expect } from '@playwright/test';
import { signUp } from './helpers';

test('a learner can edit their display name and it persists', async ({ page }) => {
  await signUp(page);
  await page.goto('/profile');

  await page.getByRole('button', { name: 'Edit display name' }).click();
  await page.getByLabel('Display name').fill('Ada Lovelace');
  await page.getByRole('button', { name: 'Save name' }).click();

  await expect(page.getByText('Ada Lovelace')).toBeVisible();

  // Persisted to Firestore: still there after a reload.
  await page.reload();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
});

test('signing out returns to the auth page', async ({ page }) => {
  await signUp(page);
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/auth$/);
  await expect(
    page.getByRole('heading', { name: 'Learn by doing' }),
  ).toBeVisible();
});
