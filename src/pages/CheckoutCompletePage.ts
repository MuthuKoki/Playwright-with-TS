import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  protected readonly path = '/checkout-complete.html';

  readonly header: Locator;
  readonly message: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByTestId('complete-header');
    this.message = page.getByTestId('complete-text');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  protected get loadedIndicator(): Locator {
    return this.header;
  }
}
