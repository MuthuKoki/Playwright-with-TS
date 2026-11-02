import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';

// Login specs must start logged out, so drop the shared session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in', { tag: ['@smoke'] }, async ({ loginPage, inventoryPage }) => {
    await loginPage.loginAs(users.standard);

    await inventoryPage.expectLoaded();
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('locked out user sees an error', { tag: ['@regression'] }, async ({ loginPage }) => {
    await loginPage.loginAs(users.lockedOut);

    await loginPage.expectError('Epic sadface: Sorry, this user has been locked out.');
  });

  const invalidCases = [
    { title: 'empty username', username: '', password: 'secret_sauce', error: 'Epic sadface: Username is required' },
    { title: 'empty password', username: 'standard_user', password: '', error: 'Epic sadface: Password is required' },
    {
      title: 'wrong password',
      username: 'standard_user',
      password: 'wrong_password',
      error: 'Epic sadface: Username and password do not match any user in this service',
    },
  ];

  for (const { title, username, password, error } of invalidCases) {
    test(`shows validation error for ${title}`, { tag: ['@regression'] }, async ({ loginPage }) => {
      await loginPage.login(username, password);

      await loginPage.expectError(error);
    });
  }

  test('protected pages redirect to login when logged out', { tag: ['@regression'] }, async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await loginPage.expectError("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  });

  test('user can log out', { tag: ['@smoke'] }, async ({ loginPage, inventoryPage }) => {
    await loginPage.loginAs(users.standard);
    await inventoryPage.header.logout();

    await expect(loginPage.loginButton).toBeVisible();
  });
});
