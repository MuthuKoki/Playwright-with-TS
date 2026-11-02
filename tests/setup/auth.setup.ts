import { test as setup, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';
import { STORAGE_STATE } from '../../src/config/env';

// Logs in once and saves the session so UI specs start already authenticated.
setup('authenticate as standard_user', async ({ page, loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.loginAs(users.standard);
  await inventoryPage.expectLoaded();
  await expect(inventoryPage.title).toHaveText('Products');
  await page.context().storageState({ path: STORAGE_STATE });
});
