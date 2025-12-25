import { faker } from '@faker-js/faker';

export default (overrides = {}) => ({
  package_id: overrides.package_id ?? faker.number.int({ min: 1, max: 1000000 }),
  vaccine_id: overrides.vaccine_id ?? faker.number.int({ min: 1, max: 1000000 }),
  dosage: overrides.dosage ?? faker.number.int({ min: 1, max: 5 }),
});
