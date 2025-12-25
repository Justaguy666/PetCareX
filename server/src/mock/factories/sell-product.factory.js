import { faker } from '@faker-js/faker';

export const createSellProduct = (overrides = {}) => ({
  service_id: overrides.service_id ?? faker.number.int({ min: 1, max: 1000000 }),
  product_id: overrides.product_id ?? faker.number.int({ min: 1, max: 1000000 }),
  quantity: overrides.quantity || faker.number.int({ min: 1, max: 100 }),
});

export default (overrides = {}) => ({
  ...createSellProduct(overrides),
});
