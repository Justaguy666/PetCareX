import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const appointmentServiceTypes = loadEnum('appointment-service-type');

export default (overrides = {}) => ({
  promotion_id: overrides.promotion_id || faker.number.int({ min: 1, max: 1000000 }),
  service_type: overrides.service_type || faker.helpers.arrayElement(appointmentServiceTypes),
  discount_percentage: overrides.discount_percentage ?? faker.number.int({ min: 0, max: 100 }),
});
