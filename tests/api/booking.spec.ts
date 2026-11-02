import { test, expect } from '../../src/fixtures/test';
import {
  bookingIdListSchema,
  bookingSchema,
  createBookingResponseSchema,
  authResponseSchema,
} from '../../src/api/schemas/booking';
import { buildBooking } from '../../src/data/booking';
import { BOOKING_PASSWORD, BOOKING_USERNAME } from '../../src/config/env';

test.describe('Booking API · auth', () => {
  test('POST /auth returns a token for valid credentials', { tag: ['@smoke', '@api'] }, async ({ bookingClient }) => {
    const response = await bookingClient.createToken({ username: BOOKING_USERNAME, password: BOOKING_PASSWORD });

    expect(response.status()).toBe(200);
    expect(authResponseSchema.parse(await response.json()).token).toMatch(/^\w+$/);
  });

  test('POST /auth rejects bad credentials', { tag: ['@api'] }, async ({ bookingClient }) => {
    const response = await bookingClient.createToken({ username: BOOKING_USERNAME, password: 'wrong' });

    // Restful-Booker signals auth failure in the body rather than with a 401.
    expect(await response.json()).toEqual({ reason: 'Bad credentials' });
  });
});

test.describe('Booking API · CRUD', () => {
  test('full booking lifecycle: create, read, update, patch, delete', { tag: ['@smoke', '@api', '@e2e'] }, async ({
    bookingClient,
    bookingToken,
  }) => {
    const booking = buildBooking();
    let bookingId = 0;

    await test.step('create a booking', async () => {
      const response = await bookingClient.create(booking);
      expect(response.status()).toBe(200);

      const body = createBookingResponseSchema.parse(await response.json());
      expect(body.booking).toEqual(booking);
      bookingId = body.bookingid;
    });

    await test.step('read it back', async () => {
      const response = await bookingClient.get(bookingId);
      expect(response.status()).toBe(200);
      expect(bookingSchema.parse(await response.json())).toEqual(booking);
    });

    const updated = { ...booking, totalprice: 400, depositpaid: false, additionalneeds: 'Late checkout' };

    await test.step('replace it with PUT', async () => {
      const response = await bookingClient.update(bookingId, updated, bookingToken);
      expect(response.status()).toBe(200);
      expect(bookingSchema.parse(await response.json())).toEqual(updated);
    });

    await test.step('change dates with PATCH', async () => {
      const bookingdates = { checkin: '2027-02-01', checkout: '2027-02-05' };
      const response = await bookingClient.partialUpdate(bookingId, { bookingdates }, bookingToken);
      expect(response.status()).toBe(200);
      expect(bookingSchema.parse(await response.json())).toEqual({ ...updated, bookingdates });
    });

    await test.step('delete it', async () => {
      const response = await bookingClient.delete(bookingId, bookingToken);
      // Restful-Booker returns 201 Created for a successful delete.
      expect(response.status()).toBe(201);
    });

    await test.step('it is gone', async () => {
      const response = await bookingClient.get(bookingId);
      expect(response.status()).toBe(404);
    });
  });

  test('GET /booking returns a list of booking ids', { tag: ['@api'] }, async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.list();

    expect(response.status()).toBe(200);
    const ids = bookingIdListSchema.parse(await response.json());
    expect(ids.map((b) => b.bookingid)).toContain(createdBooking.bookingid);
  });

  test('GET /booking filters by guest name', { tag: ['@api'] }, async ({ bookingClient, createdBooking }) => {
    const { firstname, lastname } = createdBooking.booking;

    const response = await bookingClient.list({ firstname, lastname });

    const ids = bookingIdListSchema.parse(await response.json());
    expect(ids).toEqual([{ bookingid: createdBooking.bookingid }]);
  });

  test('GET /booking/:id returns 404 for an unknown booking', { tag: ['@api'] }, async ({ bookingClient }) => {
    const response = await bookingClient.get(999_999_999);

    expect(response.status()).toBe(404);
  });
});

test.describe('Booking API · negative', () => {
  test('PUT without a valid token is forbidden', { tag: ['@api', '@security'] }, async ({
    bookingClient,
    createdBooking,
  }) => {
    const response = await bookingClient.update(
      createdBooking.bookingid,
      { ...createdBooking.booking, totalprice: 1 },
      'invalid-token',
    );

    expect(response.status()).toBe(403);
  });

  test('DELETE without a valid token is forbidden and the booking survives', { tag: ['@api', '@security'] }, async ({
    bookingClient,
    createdBooking,
  }) => {
    const response = await bookingClient.delete(createdBooking.bookingid, 'invalid-token');
    expect(response.status()).toBe(403);

    const check = await bookingClient.get(createdBooking.bookingid);
    expect(check.status()).toBe(200);
  });

  const invalidPayloads = [
    { title: 'missing firstname', mutate: ({ firstname, ...rest }: Record<string, unknown>) => rest },
    { title: 'missing bookingdates', mutate: ({ bookingdates, ...rest }: Record<string, unknown>) => rest },
    { title: 'empty body', mutate: () => ({}) },
  ];

  for (const { title, mutate } of invalidPayloads) {
    test(`POST /booking rejects a payload with ${title}`, { tag: ['@api'] }, async ({ bookingClient }) => {
      const response = await bookingClient.create(mutate({ ...buildBooking() }));

      // The API answers 500 here instead of 400; assert it is rejected rather than pinning that quirk.
      expect(response.ok()).toBe(false);
    });
  }
});
