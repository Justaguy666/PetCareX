import { faker } from '@faker-js/faker';

export default (overrides = {}) => ({
  branch_id: overrides.branch_id ?? faker.number.int({ min: 1, max: 1000000 }),
  product_id: overrides.product_id ?? faker.number.int({ min: 1, max: 1000000 }),
  quantity: overrides.quantity ?? faker.number.int({ min: 0, max: 1000 }),
});
