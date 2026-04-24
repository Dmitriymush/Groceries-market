import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByTestId('login-username')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByTestId('login-username').fill('wrong');
    await page.getByTestId('login-password').locator('input').fill('wrong');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('should login successfully and redirect to groceries', async ({ page }) => {
    await page.getByTestId('login-username').fill('demo');
    await page.getByTestId('login-password').locator('input').fill('demo123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/groceries/);
    await expect(page.getByTestId('grocery-table')).toBeVisible();
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/groceries');
    await expect(page).toHaveURL(/login/);
  });

  test('should logout successfully', async ({ page }) => {
    await page.getByTestId('login-username').fill('demo');
    await page.getByTestId('login-password').locator('input').fill('demo123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/groceries/);
    await page.getByTestId('logout-btn').click();
    await expect(page).toHaveURL(/login/);
  });
});
