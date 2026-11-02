import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from '../components/HeaderComponent';
import { HealingLocator } from '../utils/HealingLocator';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  readonly header: HeaderComponent;
  readonly items: Locator;
  readonly itemNames: Locator;
  // Checkout is the path to revenue, so its button gets self-healing fallbacks.
  private readonly checkout: HealingLocator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkout = new HealingLocator('Cart › checkout', page.getByTestId('checkout'), [
      page.getByRole('button', { name: 'Checkout' }),
      page.locator('#checkout'),
    ]);
    this.checkoutButton = this.checkout.locator;
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  protected get loadedIndicator(): Locator {
    return this.checkoutButton;
  }

  async removeItem(name: string): Promise<void> {
    await this.items
      .filter({ has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }) })
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async getNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async startCheckout(): Promise<void> {
    await this.checkout.click();
  }
}
