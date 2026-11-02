import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Shared behaviour for every page object. Each subclass declares its own `path`
 * so navigation and URL assertions stay in one place.
 */
export abstract class BasePage {
  protected abstract readonly path: string;
  /** An element that exists only on this page, used to confirm the new view has rendered. */
  protected abstract get loadedIndicator(): Locator;

  constructor(protected readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectLoaded(): Promise<void> {
    // Compare the pathname exactly so query strings don't matter and '/' can't match every URL.
    await expect(this.page).toHaveURL((url) => url.pathname === this.path);
    // The app updates the URL before it re-renders, so the previous page's DOM can still be
    // present; waiting for a page-unique element avoids reading stale content.
    await expect(this.loadedIndicator).toBeVisible();
  }

  /**
   * Fills a React-controlled input and confirms the value stuck. Right after a route change the
   * form can still be mounting and wipe an early keystroke (seen on WebKit), so retry until it holds.
   */
  protected async fillAndVerify(input: Locator, value: string): Promise<void> {
    await expect(async () => {
      await input.fill(value);
      await expect(input).toHaveValue(value, { timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
  }
}
