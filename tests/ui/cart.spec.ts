import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/data/products';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack.name, products.fleeceJacket.name);
    await inventoryPage.header.openCart();
    await cartPage.expectLoaded();
  });

  test('shows the products that were added', { tag: ['@smoke'] }, async ({ cartPage }) => {
    await expect(cartPage.itemNames).toHaveText([products.backpack.name, products.fleeceJacket.name]);
  });

  test('removing a product updates the cart', { tag: ['@regression'] }, async ({ cartPage }) => {
    await cartPage.removeItem(products.backpack.name);

    await expect(cartPage.items).toHaveCount(1);
    await cartPage.header.expectCartCount(1);
  });

  test('cart contents persist after continuing shopping', { tag: ['@regression'] }, async ({ cartPage, inventoryPage }) => {
    await cartPage.continueShoppingButton.click();
    await inventoryPage.expectLoaded();
    await inventoryPage.header.expectCartCount(2);

    await inventoryPage.header.openCart();
    await expect(cartPage.items).toHaveCount(2);
  });
});
