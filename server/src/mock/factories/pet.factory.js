import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const petGenders = loadEnum('pet-gender');
const healthStatuses = loadEnum('health-status');

// Sanitize name to match name_text domain constraint
const sanitizeName = (name) => name.replace(/[^A-Za-zÀ-ỹà-ỹ ''-]/g, '').trim();
// Sanitize label to match label_text domain constraint
const sanitizeLabel = (label) => label.replace(/[^A-Za-zÀ-ỹà-ỹ0-9 ()''-]/g, '').trim();

export const createPet = (overrides = {}) => ({
  pet_name: sanitizeName(overrides.pet_name || faker.animal.petName?.() || faker.animal.type()),
  species: sanitizeLabel(overrides.species || faker.animal.type()),
  breed: overrides.breed ? sanitizeLabel(overrides.breed) : (faker.animal.bird?.() ? sanitizeLabel(faker.animal.bird()) : null),
  date_of_birth: overrides.date_of_birth || faker.date.past(),
  gender: overrides.gender ?? faker.helpers.arrayElement(petGenders),
  owner_id: overrides.owner_id || faker.number.int({ min: 1, max: 1000000 }),
  health_status: overrides.health_status || faker.helpers.arrayElement(healthStatuses),
});

export default (overrides = {}) => createPet(overrides);
