import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from './schemas/booking';

export interface Credentials {
  username: string;
  password: string;
}

/**
 * Service object for the Restful-Booker /booking and /auth resources.
 * Write operations take a token, which the API expects as a `token` cookie.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  createToken(credentials: Credentials): Promise<APIResponse> {
    return this.request.post('/auth', { data: credentials });
  }

  list(filters?: { firstname?: string; lastname?: string; checkin?: string; checkout?: string }): Promise<APIResponse> {
    return this.request.get('/booking', { params: filters });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  create(booking: Booking | Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  update(id: number, booking: Booking, token: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: authHeader(token) });
  }

  partialUpdate(id: number, changes: Partial<Booking>, token: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: changes, headers: authHeader(token) });
  }

  delete(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: authHeader(token) });
  }
}

function authHeader(token: string): Record<string, string> {
  return { Cookie: `token=${token}` };
}
