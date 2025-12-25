import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const genders = loadEnum('gender');
const roles = loadEnum('employee-role');

// Sanitize name to match name_text domain constraint: ^[A-Za-zÀ-ỹà-ỹ ''-]+$
const sanitizeName = (name) => name.replace(/[^A-Za-zÀ-ỹà-ỹ ''-]/g, '').trim();

export const createEmployee = (overrides = {}) => ({
  full_name: sanitizeName(overrides.full_name || faker.person.fullName()),
  date_of_birth: overrides.date_of_birth || faker.date.birthdate({ min: 25, max: 65, mode: 'age' }),
  gender: overrides.gender ?? faker.helpers.arrayElement(genders),
  role: overrides.role || faker.helpers.arrayElement(roles),
  base_salary: overrides.base_salary || faker.number.float({ min: 3000, max: 20000, precision: 0.01 }),
});

export default (overrides = {}) => createEmployee(overrides);
