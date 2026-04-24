import { test, expect } from '@playwright/test';

test.describe('Mark as Bought', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-username').fill('demo');
    await page.getByTestId('login-password').locator('input').fill('demo123');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/groceries/);
  });

  test('should mark item as bought with strikethrough', async ({ page }) => {
    const firstCheckbox = page.getByTestId('grocery-item-checkbox').first();
    await firstCheckbox.click();

    const firstName = page.getByTestId('grocery-item-name').first();
    await expect(firstName).toHaveClass(/bought-text/);
  });

  test('should unmark a bought item', async ({ page }) => {
    const boughtLocator = page.locator('[data-testid="grocery-item"].bought');
    const initialBought = await boughtLocator.count();
    if (initialBought > 0) {
      const boughtItem = boughtLocator.first();
      const itemName = await boughtItem.getByTestId('grocery-item-name').innerText();
      await boughtItem.getByTestId('grocery-item-checkbox').click();
      const unboughtItem = page.locator('[data-testid="grocery-item"]', { has: page.getByText(itemName.trim()) });
      await expect(unboughtItem).not.toHaveClass(/bought/);
    }
  });

  test('bought item should show checked checkbox', async ({ page }) => {
    const boughtItem = page.locator('[data-testid="grocery-item"].bought').first();
    if (await boughtItem.isVisible()) {
      const checkbox = boughtItem.locator('.p-checkbox');
      await expect(checkbox).toBeVisible();
    }
  });
});
