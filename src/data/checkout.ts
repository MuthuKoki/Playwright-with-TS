export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const validCustomer: CustomerInfo = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  postalCode: '600001',
};

export const checkoutValidationCases: { title: string; info: Partial<CustomerInfo>; error: string }[] = [
  {
    title: 'first name is missing',
    info: { lastName: 'Lovelace', postalCode: '600001' },
    error: 'Error: First Name is required',
  },
  {
    title: 'last name is missing',
    info: { firstName: 'Ada', postalCode: '600001' },
    error: 'Error: Last Name is required',
  },
  {
    title: 'postal code is missing',
    info: { firstName: 'Ada', lastName: 'Lovelace' },
    error: 'Error: Postal Code is required',
  },
];
