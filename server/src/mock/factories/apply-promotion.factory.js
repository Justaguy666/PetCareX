import { faker } from '@faker-js/faker';

export const createApplyPromotion = (overrides = {}) => {
  const start = overrides.start_date ? new Date(overrides.start_date) : faker.date.recent({ days: 30 });
  const end = overrides.end_date ? new Date(overrides.end_date) : faker.date.future({ years: 1, refDate: start });
  
  return {
    promotion_id: overrides.promotion_id || faker.number.int({ min: 1, max: 1000000 }),
    branch_id: overrides.branch_id || faker.number.int({ min: 1, max: 1000000 }),
    start_date: start.toISOString(),
    end_date: end.toISOString(),
  };
};

export default (overrides = {}) => ({
  ...createApplyPromotion(overrides),
});
