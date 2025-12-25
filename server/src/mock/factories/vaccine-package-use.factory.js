import { faker } from '@faker-js/faker';

export default (overrides = {}) => {
  const isCompleted = overrides.is_completed ?? faker.datatype.boolean();
  return {
    package_injection_id: overrides.package_injection_id ?? (faker.datatype.boolean() ? faker.number.int({ min: 1, max: 1000000 }) : null),
    package_id: overrides.package_id ?? faker.number.int({ min: 1, max: 1000000 }),
    injection_number: overrides.injection_number || faker.number.int({ min: 1, max: 10 }),
    next_injection_date: overrides.next_injection_date !== undefined ? overrides.next_injection_date : (isCompleted ? null : faker.date.soon()),
    is_completed: isCompleted,
  };
};
