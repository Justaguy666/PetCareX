import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const statuses = loadEnum('status');
const appointmentServiceTypes = loadEnum('appointment-service-type');

export default (overrides = {}) => ({
  pet_id: overrides.pet_id ?? faker.number.int({ min: 1, max: 1000000 }),
  owner_id: overrides.owner_id ?? faker.number.int({ min: 1, max: 1000000 }),
  branch_id: overrides.branch_id ?? faker.number.int({ min: 1, max: 1000000 }),
  doctor_id: overrides.doctor_id ?? faker.number.int({ min: 1, max: 1000000 }),
  service_type: overrides.service_type || faker.helpers.arrayElement(appointmentServiceTypes),
  appointment_time: overrides.appointment_time || faker.date.soon().toISOString(),
  reason: overrides.reason || faker.lorem.sentence(),
  status: overrides.status || faker.helpers.arrayElement(statuses),
  cancelled_reason: overrides.cancelled_reason ?? (faker.datatype.boolean() ? faker.lorem.sentence() : null),
});
