import { z } from 'zod';

// Response contracts for Restful-Booker. Tests parse responses through these,
// so any change to field names or types fails loudly with a readable diff.

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const bookingSchema = z.strictObject({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number().int().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: z.strictObject({
    checkin: isoDate,
    checkout: isoDate,
  }),
  additionalneeds: z.string().optional(),
});

export const createBookingResponseSchema = z.strictObject({
  bookingid: z.number().int().positive(),
  booking: bookingSchema,
});

export const bookingIdListSchema = z.array(z.strictObject({ bookingid: z.number().int().positive() }));

export const authResponseSchema = z.strictObject({ token: z.string().min(1) });

export type Booking = z.infer<typeof bookingSchema>;
export type CreateBookingResponse = z.infer<typeof createBookingResponseSchema>;
