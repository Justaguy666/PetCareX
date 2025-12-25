import { faker } from '@faker-js/faker';

export default (overrides = {}) => ({
  package_name: overrides.package_name || faker.commerce.productName(),
  monthly_milestone: overrides.monthly_milestone || faker.number.int({ min: 1, max: 12 }),
  cycle: overrides.cycle || faker.number.int({ min: 1, max: 12 }),
  price: overrides.price || faker.number.float({ min: 0, max: 500000, precision: 0.01 }),
});
