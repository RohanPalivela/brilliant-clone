import { test, expect } from '@playwright/test';
import { makeUser, signUp } from './helpers';

test('redirects unauthenticated visitors to the auth page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/auth$/);
  await expect(
    page.getByRole('heading', { name: 'Learn by doing' }),
  ).toBeVisible();
});

test('a new learner can sign up and reach the home page', async ({ page }) => {
  const user = await signUp(page);
  await expect(
    page.getByRole('heading', { name: /Good (morning|afternoon|evening)/ }),
  ).toBeVisible();
  // The empty-state CTA appears for a brand-new account.
  await expect(
    page.getByRole('button', { name: /Start Mastering Dynamic Programming/ }),
  ).toBeVisible();
  expect(user.email).toContain('@test.dev');
});

test('an existing learner can sign back in', async ({ page }) => {
  const user = makeUser('returning');
  await signUp(page, user);

  // Sign out, then sign back in with the same credentials.
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/auth$/);

  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Signing in returns the learner to the protected page they came from
  // (/profile), confirming they're authenticated again.
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
});

test('shows a friendly error for invalid credentials', async ({ page }) => {
  await page.goto('/auth');
  await page.getByLabel('Email').fill('nobody@test.dev');
  await page.getByLabel('Password').fill('wrongpassword');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText(/don.t match|Something went wrong/)).toBeVisible();
});
