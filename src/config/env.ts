// Central place for environment-driven settings; every value can be overridden in CI.
export const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
export const API_BASE_URL = process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';
export const STORAGE_STATE = 'playwright/.auth/standard_user.json';

export const BOOKING_API_URL = process.env.BOOKING_API_URL ?? 'https://restful-booker.herokuapp.com';
// Restful-Booker publishes these admin credentials in its docs.
export const BOOKING_USERNAME = process.env.BOOKING_USERNAME ?? 'admin';
export const BOOKING_PASSWORD = process.env.BOOKING_PASSWORD ?? 'password123';
