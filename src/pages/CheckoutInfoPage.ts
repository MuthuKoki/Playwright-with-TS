import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CustomerInfo } from '../data/checkout';

export class CheckoutInfoPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.errorMessage = page.getByTestId('error');
  }

  protected get loadedIndicator(): Locator {
    return this.continueButton;
  }

  async fillCustomerInfo(info: Partial<CustomerInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.fillAndVerify(this.firstNameInput, info.firstName);
    if (info.lastName !== undefined) await this.fillAndVerify(this.lastNameInput, info.lastName);
    if (info.postalCode !== undefined) await this.fillAndVerify(this.postalCodeInput, info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }
}
