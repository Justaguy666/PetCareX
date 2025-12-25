import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const serviceTypes = loadEnum('service-type');

export default (overrides = {}) => {
  const unit_price = overrides.unit_price ?? faker.number.float({ min: 0, max: 100000, precision: 0.01 });
  const discount_amount = overrides.discount_amount ?? faker.number.float({ min: 0, max: unit_price, precision: 0.01 });
  return {
    invoice_id: overrides.invoice_id || (faker.datatype.boolean() ? faker.number.int({ min: 1, max: 1000000 }) : null),
    type_of_service: overrides.type_of_service || faker.helpers.arrayElement(serviceTypes),
    quality_rating: overrides.quality_rating ?? faker.helpers.arrayElement([1, 2, 3, 4, 5]),
    employee_attitude_rating: overrides.employee_attitude_rating ?? faker.helpers.arrayElement([1, 2, 3, 4, 5]),
    comment: overrides.comment || faker.lorem.sentence(),
    unit_price,
    discount_amount,
  };
};
