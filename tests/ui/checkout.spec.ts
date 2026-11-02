import { test, expect } from '../../src/fixtures/test';
import { products, TAX_RATE } from '../../src/data/products';
import { validCustomer, checkoutValidationCases } from '../../src/data/checkout';

const cartItems = [products.backpack, products.bikeLight, products.onesie];

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage, cartPage, checkoutInfoPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(...cartItems.map((p) => p.name));
    await inventoryPage.header.openCart();
    await cartPage.expectLoaded();
    await cartPage.startCheckout();
    await checkoutInfoPage.expectLoaded();
  });

  test('completes an order end to end', { tag: ['@smoke', '@e2e'] }, async ({
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    inventoryPage,
  }) => {
    await test.step('enter customer details', async () => {
      await checkoutInfoPage.fillCustomerInfo(validCustomer);
      await checkoutInfoPage.continue();
      await checkoutOverviewPage.expectLoaded();
    });

    await test.step('review the order', async () => {
      await expect(checkoutOverviewPage.itemNames).toHaveText(cartItems.map((p) => p.name));
    });

    await test.step('place the order', async () => {
      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectLoaded();
      await expect(checkoutCompletePage.header).toHaveText('Thank you for your order!');
    });

    await test.step('cart is empty after ordering', async () => {
      await checkoutCompletePage.backHomeButton.click();
      await inventoryPage.header.expectCartCount(0);
    });
  });

  test('order summary totals are calculated correctly', { tag: ['@regression'] }, async ({
    checkoutInfoPage,
    checkoutOverviewPage,
  }) => {
    await checkoutInfoPage.fillCustomerInfo(validCustomer);
    await checkoutInfoPage.continue();
    await checkoutOverviewPage.expectLoaded();

    const expectedItemTotal = round(cartItems.reduce((sum, p) => sum + p.price, 0));
    const expectedTax = round(expectedItemTotal * TAX_RATE);
    const summary = await checkoutOverviewPage.getSummary();

    expect(await checkoutOverviewPage.getItemPrices()).toEqual(cartItems.map((p) => p.price));
    expect(summary.itemTotal).toBe(expectedItemTotal);
    expect(summary.tax).toBe(expectedTax);
    expect(summary.total).toBe(round(expectedItemTotal + expectedTax));
  });

  for (const { title, info, error } of checkoutValidationCases) {
    test(`shows validation error when ${title}`, { tag: ['@regression'] }, async ({ checkoutInfoPage }) => {
      await checkoutInfoPage.fillCustomerInfo(info);
      await checkoutInfoPage.continue();

      await checkoutInfoPage.expectError(error);
    });
  }

  test('cancelling checkout returns to the cart', { tag: ['@regression'] }, async ({ checkoutInfoPage, cartPage }) => {
    await checkoutInfoPage.cancelButton.click();

    await cartPage.expectLoaded();
    await expect(cartPage.items).toHaveCount(cartItems.length);
  });
});

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
