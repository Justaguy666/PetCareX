import { faker } from '@faker-js/faker';

export const createMedicine = (overrides = {}) => ({
  medicine_name: overrides.medicine_name || faker.commerce.productName(),
  description: overrides.description || faker.lorem.sentence(),
  price: overrides.price || faker.number.float({ min: 0, max: 10000, precision: 0.01 }),
});

export default (overrides = {}) => ({
  ...createMedicine(overrides),
});
