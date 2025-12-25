import { faker } from '@faker-js/faker';

export const createMobilization = (overrides = {}) => ({
  employee_id: overrides.employee_id || faker.number.int({ min: 1, max: 1000000 }),
  branch_id: overrides.branch_id || faker.number.int({ min: 1, max: 1000000 }),
  start_date: overrides.start_date || faker.date.past().toISOString(),
  end_date: overrides.end_date ?? (faker.datatype.boolean() ? faker.date.future().toISOString() : null),
});

export default (overrides = {}) => ({
  ...createMobilization(overrides),
});
