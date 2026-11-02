import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface OrderSummary {
  itemTotal: number;
  tax: number;
  total: number;
}

export class CheckoutOverviewPage extends BasePage {
  protected readonly path = '/checkout-step-two.html';

  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  protected get loadedIndicator(): Locator {
    return this.finishButton;
  }

  async getItemPrices(): Promise<number[]> {
    const prices = await this.itemPrices.allTextContents();
    return prices.map(toAmount);
  }

  async getSummary(): Promise<OrderSummary> {
    return {
      itemTotal: toAmount(await this.subtotalLabel.innerText()),
      tax: toAmount(await this.taxLabel.innerText()),
      total: toAmount(await this.totalLabel.innerText()),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}

/** "Item total: $39.98" -> 39.98 */
function toAmount(text: string): number {
  const match = text.match(/\$(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`No dollar amount found in "${text}"`);
  return Number(match[1]);
}
