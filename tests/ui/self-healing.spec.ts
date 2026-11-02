import type { Page } from '@playwright/test';
import { test, expect } from '../../src/fixtures/test';
import { EXPECTED_HEAL_ANNOTATION, HEALED_ANNOTATION, HealingLocator } from '../../src/utils/HealingLocator';
import { users } from '../../src/data/users';
import { products } from '../../src/data/products';

// These specs simulate a front-end change by stripping the attributes our primary
// locators rely on, then check that the fallbacks are used *and* reported.

/** Removes `data-test` attributes from matching elements to simulate a UI refactor. */
async function stripTestIds(page: Page, selector: string): Promise<void> {
  await page.locator(selector).first().waitFor();
  await page.evaluate((sel) => {
    document.querySelectorAll(sel).forEach((el) => el.removeAttribute('data-test'));
  }, selector);
}

const healedAnnotations = () => test.info().annotations.filter((a) => a.type === HEALED_ANNOTATION);

test.describe('Self-healing locators', { tag: ['@healing'] }, () => {
  test.beforeEach(() => {
    test.info().annotations.push({ type: EXPECTED_HEAL_ANNOTATION, description: 'heals are deliberate in this spec' });
  });

  test.describe('on the login page', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('login still works when data-test ids are removed, and every heal is reported', { tag: ['@regression'] }, async ({
      page,
      loginPage,
      inventoryPage,
    }) => {
      await loginPage.goto();
      await stripTestIds(page, '[data-test="username"], [data-test="password"], [data-test="login-button"]');

      await loginPage.loginAs(users.standard);

      await inventoryPage.expectLoaded();
      expect(healedAnnotations().map((a) => a.description)).toEqual([
        expect.stringContaining('Login › username'),
        expect.stringContaining('Login › password'),
        expect.stringContaining('Login › submit'),
      ]);
    });

    test('nothing is reported when the primary locators work', { tag: ['@regression'] }, async ({
      loginPage,
      inventoryPage,
    }) => {
      await loginPage.goto();
      await loginPage.loginAs(users.standard);

      await inventoryPage.expectLoaded();
      expect(healedAnnotations()).toEqual([]);
    });

    test('with healing disabled, a broken primary locator fails fast', { tag: ['@regression'] }, async ({
      page,
      loginPage,
    }) => {
      await loginPage.goto();
      await stripTestIds(page, '[data-test="login-button"]');

      const strict = new HealingLocator('Login › submit', page.getByTestId('login-button'), [page.locator('#login-button')], false);

      // The fallback would have matched, but with healing off the primary failure must surface.
      await expect(page.locator('#login-button')).toBeVisible();
      await expect(strict.click({ timeout: 1_000 })).rejects.toThrow(/Timeout 1000ms exceeded/);
      expect(healedAnnotations()).toEqual([]);
    });
  });

  test('add to cart heals to the data-test fallback when the button text changes', { tag: ['@regression'] }, async ({
    page,
    inventoryPage,
  }) => {
    await inventoryPage.goto();
    // Wait until React has rendered the buttons, or the mutation below can run on an empty list.
    await expect(page.locator('[data-test^="add-to-cart"]')).toHaveCount(6);
    // Simulate a copy change: "Add to cart" -> "Buy now" breaks the role+name locator.
    await page.evaluate(() => {
      document.querySelectorAll('[data-test^="add-to-cart"]').forEach((b) => (b.textContent = 'Buy now'));
    });

    await inventoryPage.addToCart(products.backpack.name);

    await inventoryPage.header.expectCartCount(1);
    expect(healedAnnotations()).toEqual([
      expect.objectContaining({ description: expect.stringContaining('add "Sauce Labs Backpack" to cart') }),
    ]);
  });
});
