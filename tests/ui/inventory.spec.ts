import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/data/products';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('lists all six products', { tag: ['@smoke'] }, async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(Object.keys(products).length);
  });

  test('sorts products by name A to Z', { tag: ['@regression'] }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');

    const names = await inventoryPage.getNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('sorts products by name Z to A', { tag: ['@regression'] }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    const names = await inventoryPage.getNames();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('sorts products by price low to high', { tag: ['@regression'] }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts products by price high to low', { tag: ['@regression'] }, async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');

    const prices = await inventoryPage.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('opens product details from the list', { tag: ['@regression'] }, async ({ inventoryPage, productDetailsPage }) => {
    await inventoryPage.openItem(products.backpack.name);

    await productDetailsPage.expectLoaded();
    await expect(productDetailsPage.name).toHaveText(products.backpack.name);
    await expect(productDetailsPage.price).toHaveText(`$${products.backpack.price}`);
  });

  test('adding and removing products updates the cart badge', { tag: ['@smoke'] }, async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name, products.bikeLight.name);
    await inventoryPage.header.expectCartCount(2);

    await inventoryPage.removeFromCart(products.backpack.name);
    await inventoryPage.header.expectCartCount(1);
  });
});
