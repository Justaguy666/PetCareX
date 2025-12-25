import { faker } from '@faker-js/faker';

const usedUsernames = new Set();

const generateUniqueUsername = (overridesValue) => {
  if (overridesValue) return overridesValue;
  
  let username;
  let retries = 0;
  const maxRetries = 100000;
  
  do {
    if (typeof faker.internet.userName === 'function') {
      username = faker.internet.userName();
    } else {
      username = `${faker.person.firstName().toLowerCase()}.${faker.person.lastName().toLowerCase()}${faker.number.int({ min: 1, max: 9999 })}`;
    }
    retries++;
    if (retries > maxRetries) {
      throw new Error('Exceeded maximum retries for generating unique username');
    }
  } while (usedUsernames.has(username));
  
  usedUsernames.add(username);
  return username;
};

export default (overrides = {}) => ({
  user_id: overrides.user_id || faker.number.int({ min: 1, max: 1000000 }),
  username: generateUniqueUsername(overrides.username),
  hashed_password: overrides.hashed_password || faker.internet.password(),
  is_active: overrides.is_active ?? faker.datatype.boolean(),
  last_login_at: overrides.last_login_at || faker.date.recent().toISOString(),
});