import { faker } from '@faker-js/faker';

export const createVaccine = (overrides = {}) => ({
  vaccine_name: overrides.vaccine_name || faker.commerce.productName(),
  price: overrides.price || faker.number.float({ min: 0, max: 10000, precision: 0.01 }),
});

export default (overrides = {}) => ({
  ...createVaccine(overrides),
});
