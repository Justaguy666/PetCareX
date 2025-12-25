import { faker } from '@faker-js/faker';

const usedPhones = new Set();

const truncate = (s, n) => (typeof s === 'string' && s.length > n ? s.slice(0, n) : s);

const vnPhone = (overridesValue) => {
  if (overridesValue && typeof overridesValue === 'string' && /^[0-9]{10}$/.test(overridesValue)) return overridesValue;
  
  let phone;
  let retries = 0;
  const maxRetries = 100000;
  
  do {
    phone = `0${faker.string.numeric(9)}`;
    retries++;
    if (retries > maxRetries) {
      throw new Error('Exceeded maximum retries for generating unique phone number');
    }
  } while (usedPhones.has(phone));
  
  usedPhones.add(phone);
  return phone;
};

export default (overrides = {}) => ({
  branch_name: truncate(overrides.branch_name || faker.company.name(), 100),
  address: truncate(overrides.address || faker.location.streetAddress(), 200),
  phone_number: vnPhone(overrides.phone_number),
  opening_at: overrides.opening_at || new Date('1970-01-01T08:00:00.000Z'),
  closing_at: overrides.closing_at || new Date('1970-01-01T22:00:00.000Z'),
  manager_id: overrides.manager_id || null,
});
