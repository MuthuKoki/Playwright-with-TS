import { test, expect } from '../../src/fixtures/test';

// Seed for the Playwright test agents (planner / generator / healer): it puts the browser
// on the inventory page as a logged-in standard_user, using this framework's own fixtures,
// so generated tests start from the same state as the rest of the suite.
test.describe('Agent seed', () => {
  test('seed', { tag: ['@seed'] }, async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.title).toHaveText('Products');
  });
});
