import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HealingLocator } from '../utils/HealingLocator';
import type { User } from '../data/users';

export class LoginPage extends BasePage {
  protected readonly path = '/';

  // Login is the entry point for every UI test, so its controls get self-healing fallbacks.
  private readonly username: HealingLocator;
  private readonly password: HealingLocator;
  private readonly submit: HealingLocator;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.username = new HealingLocator('Login › username', page.getByTestId('username'), [
      page.getByPlaceholder('Username'),
      page.locator('#user-name'),
    ]);
    this.password = new HealingLocator('Login › password', page.getByTestId('password'), [
      page.getByPlaceholder('Password'),
      page.locator('#password'),
    ]);
    this.submit = new HealingLocator('Login › submit', page.getByTestId('login-button'), [
      page.getByRole('button', { name: 'Login' }),
      page.locator('#login-button'),
    ]);
    this.usernameInput = this.username.locator;
    this.passwordInput = this.password.locator;
    this.loginButton = this.submit.locator;
    this.errorMessage = page.getByTestId('error');
  }

  protected get loadedIndicator(): Locator {
    return this.loginButton;
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }

  async loginAs(user: User): Promise<void> {
    await this.login(user.username, user.password);
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }
}
