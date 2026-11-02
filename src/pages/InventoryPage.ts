import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from '../components/HeaderComponent';
import { HealingLocator } from '../utils/HealingLocator';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  readonly header: HeaderComponent;
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  protected get loadedIndicator(): Locator {
    return this.sortDropdown;
  }

  item(name: string): Locator {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }) });
  }

  addToCartButton(name: string): HealingLocator {
    const item = this.item(name);
    return new HealingLocator(`Inventory › add "${name}" to cart`, item.getByRole('button', { name: 'Add to cart' }), [
      item.locator('[data-test^="add-to-cart"]'),
    ]);
  }

  async addToCart(...names: string[]): Promise<void> {
    for (const name of names) {
      await this.addToCartButton(name).click();
    }
  }

  async removeFromCart(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async openItem(name: string): Promise<void> {
    await this.item(name).getByTestId('inventory-item-name').click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async getPrices(): Promise<number[]> {
    const prices = await this.itemPrices.allTextContents();
    return prices.map((p) => Number(p.replace('$', '')));
  }
}
