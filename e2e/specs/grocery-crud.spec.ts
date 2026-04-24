import { test, expect } from '@playwright/test';

test.describe('Grocery CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-username').fill('demo');
    await page.getByTestId('login-password').locator('input').fill('demo123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/groceries/);
  });

  test('should display grocery list', async ({ page }) => {
    await expect(page.getByTestId('grocery-table')).toBeVisible();
    const items = page.getByTestId('grocery-item');
    await expect(items.first()).toBeVisible();
  });

  test('should add a new item', async ({ page }) => {
    await page.getByTestId('add-item-btn').click();
    await expect(page.locator('role=dialog')).toBeVisible();

    const uniqueName = `TestItem_${Date.now()}`;
    await page.getByTestId('grocery-name-input').fill(uniqueName);
    await page.getByTestId('grocery-amount-input').locator('input').fill('6');
    await page.getByTestId('grocery-save-btn').click();

    await page.waitForResponse(resp =>
      resp.url().includes('/groceries') && resp.request().method() === 'GET' && resp.status() === 200
    );
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test('should edit an existing item', async ({ page }) => {
    await page.getByTestId('grocery-item-edit').first().click();
    await expect(page.locator('role=dialog')).toBeVisible();

    const uniqueName = `Edited_${Date.now()}`;
    const nameInput = page.getByTestId('grocery-name-input');
    await nameInput.clear();
    await nameInput.fill(uniqueName);
    await page.getByTestId('grocery-save-btn').click();

    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test('should delete an item', async ({ page }) => {
    const initialItems = await page.getByTestId('grocery-item').count();
    await page.getByTestId('grocery-item-delete').first().click();

    await expect(page.getByRole('alertdialog', { name: /confirm/i })).toBeVisible();
    await page.getByRole('button', { name: /yes/i }).click();

    await expect(page.getByTestId('grocery-item')).toHaveCount(initialItems - 1);
  });
});
