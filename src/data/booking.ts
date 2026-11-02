import type { Booking } from '../api/schemas/booking';

/**
 * Builds a valid booking with a unique last name. Restful-Booker is a shared public
 * sandbox, so unique data keeps parallel runs (and other users) from colliding.
 */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return {
    firstname: 'Ada',
    lastname: `Tester-${unique}`,
    totalprice: 250,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-14' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
