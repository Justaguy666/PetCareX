import { faker } from '@faker-js/faker';

export default (overrides = {}) => ({
  branch_id: overrides.branch_id ?? faker.number.int({ min: 1, max: 1000000 }),
  medicine_id: overrides.medicine_id ?? faker.number.int({ min: 1, max: 1000000 }),
  quantity: overrides.quantity ?? faker.number.int({ min: 10000, max: 1000000 }),
});
