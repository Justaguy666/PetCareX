import { faker } from '@faker-js/faker';

export const createPackageInventory = (overrides = {}) => ({
  branch_id: overrides.branch_id ?? faker.number.int({ min: 1, max: 1000000 }),
  package_id: overrides.package_id ?? faker.number.int({ min: 1, max: 1000000 }),
  quantity: overrides.quantity ?? faker.number.int({ min: 10000, max: 1000000 }),
});

export default (overrides = {}) => ({
  ...createPackageInventory(overrides),
});
