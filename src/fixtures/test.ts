import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { PostsClient } from '../api/PostsClient';
import { BookingClient } from '../api/BookingClient';
import { authResponseSchema, createBookingResponseSchema, type CreateBookingResponse } from '../api/schemas/booking';
import { buildBooking } from '../data/booking';
import { BOOKING_API_URL, BOOKING_PASSWORD, BOOKING_USERNAME } from '../config/env';

interface Pages {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
}

interface Clients {
  postsClient: PostsClient;
  bookingClient: BookingClient;
  /** A booking created for this test and deleted again afterwards. */
  createdBooking: CreateBookingResponse;
}

interface WorkerFixtures {
  /** Auth token fetched once per worker and shared by its tests. */
  bookingToken: string;
}

const bookingContextOptions = {
  baseURL: BOOKING_API_URL,
  // Restful-Booker answers 418 to GET requests that don't ask for JSON.
  extraHTTPHeaders: { Accept: 'application/json' },
};

/**
 * Custom test that injects page objects and API clients as fixtures,
 * so specs never construct them by hand.
 */
export const test = base.extend<Pages & Clients, WorkerFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),
  postsClient: async ({ request }, use) => use(new PostsClient(request)),

  bookingClient: async ({ playwright }, use) => {
    const context = await playwright.request.newContext(bookingContextOptions);
    await use(new BookingClient(context));
    await context.dispose();
  },

  bookingToken: [
    async ({ playwright }, use) => {
      const context = await playwright.request.newContext(bookingContextOptions);
      const response = await new BookingClient(context).createToken({
        username: BOOKING_USERNAME,
        password: BOOKING_PASSWORD,
      });
      expect(response.status(), 'auth request status').toBe(200);
      const { token } = authResponseSchema.parse(await response.json());
      await context.dispose();
      await use(token);
    },
    { scope: 'worker' },
  ],

  createdBooking: async ({ bookingClient, bookingToken }, use) => {
    const response = await bookingClient.create(buildBooking());
    expect(response.status(), 'create booking status').toBe(200);
    const created = createBookingResponseSchema.parse(await response.json());

    await use(created);

    // Teardown: remove test data. A test may already have deleted it, so a 404/405 here is fine.
    await bookingClient.delete(created.bookingid, bookingToken);
  },
});

export { expect };
