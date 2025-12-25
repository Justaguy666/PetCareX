import { faker } from '@faker-js/faker';

export default (overrides = {}) => ({
  single_injection_id: overrides.single_injection_id ?? (faker.datatype.boolean() ? faker.number.int({ min: 1, max: 1000000 }) : null),
  vaccine_id: overrides.vaccine_id ?? faker.number.int({ min: 1, max: 1000000 }),
  dosage: overrides.dosage ?? faker.number.int({ min: 1, max: 5 }),
});
