import { faker } from '@faker-js/faker';

export default (overrides = {}) => ({
  service_id: overrides.service_id ?? faker.number.int({ min: 1, max: 1000000 }),
  pet_id: overrides.pet_id ?? faker.number.int({ min: 1, max: 1000000 }),
  doctor_id: overrides.doctor_id ?? faker.number.int({ min: 1, max: 1000000 }),
});
