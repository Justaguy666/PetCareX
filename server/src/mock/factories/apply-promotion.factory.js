import { faker } from '@faker-js/faker';

export const createApplyPromotion = (overrides = {}) => ({
  promotion_id: overrides.promotion_id || faker.number.int({ min: 1, max: 1000000 }),
  branch_id: overrides.branch_id || faker.number.int({ min: 1, max: 1000000 }),
  start_date: overrides.start_date || faker.date.soon().toISOString(),
  end_date: overrides.end_date || faker.date.future().toISOString(),
});

export default (overrides = {}) => ({
  ...createApplyPromotion(overrides),
});
