import { faker } from '@faker-js/faker';

export default (overrides = {}) => ({
  service_id: overrides.service_id ?? null,
  pet_id: overrides.pet_id ?? null,
  doctor_id: overrides.doctor_id ?? null,
  diagnosis: overrides.diagnosis || faker.lorem.sentence(),
  conclusion: overrides.conclusion || faker.lorem.paragraph(),
  appointment_date: overrides.appointment_date || faker.date.recent().toISOString(),
});
