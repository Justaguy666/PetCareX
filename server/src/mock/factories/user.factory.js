import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const genders = loadEnum('gender');
const membershipLevels = loadEnum('membership-level');

const usedEmails = new Set();
const usedPhones = new Set();
const usedCitizenIds = new Set();

const uniqueEmail = (overridesValue) => {
  if (overridesValue && typeof overridesValue === 'string' && overridesValue.includes('@')) return overridesValue.toLowerCase();
  
  let email;
  let retries = 0;
  const maxRetries = 100000;
  
  do {
    email = faker.internet.email().toLowerCase();
    retries++;
    if (retries > maxRetries) {
      throw new Error('Exceeded maximum retries for generating unique email');
    }
  } while (usedEmails.has(email));
  
  usedEmails.add(email);
  return email;
};

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

const vnCitizenId = (overridesValue) => {
  if (overridesValue && typeof overridesValue === 'string' && /^[0-9]{12}$/.test(overridesValue)) return overridesValue;
  
  let citizenId;
  let retries = 0;
  const maxRetries = 100000;
  
  do {
    citizenId = faker.string.numeric(12);
    retries++;
    if (retries > maxRetries) {
      throw new Error('Exceeded maximum retries for generating unique citizen ID');
    }
  } while (usedCitizenIds.has(citizenId));
  
  usedCitizenIds.add(citizenId);
  return citizenId;
};

// Sanitize name to match name_text domain constraint
const sanitizeName = (name) => name.replace(/[^A-Za-zÀ-ỹà-ỹ ''-]/g, '').trim();

export default (overrides = {}) => ({
  full_name: sanitizeName(overrides.full_name || faker.person.fullName()),
  email: uniqueEmail(overrides.email),
  phone_number: vnPhone(overrides.phone_number),
  citizen_id: vnCitizenId(overrides.citizen_id),
  gender: overrides.gender ?? faker.helpers.arrayElement(genders),
  date_of_birth: overrides.date_of_birth || faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
  membership_level: overrides.membership_level || faker.helpers.arrayElement(membershipLevels),
});