import { faker } from '@faker-js/faker';

export const createRefreshToken = (overrides = {}) => ({
  account_id: overrides.account_id || faker.number.int({ min: 1, max: 1000000 }),
  token: overrides.token || faker.string.alphanumeric(64),
  expires_at: overrides.expires_at || faker.date.future().toISOString(),
});

export default (overrides = {}) => ({
  ...createRefreshToken(overrides),
});
