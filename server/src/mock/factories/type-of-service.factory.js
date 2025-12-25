import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const serviceTypes = loadEnum('service-type');
let usedTypes = [];

export const createTypeOfService = (overrides = {}) => {
  // If type is provided in overrides, use it
  if (overrides.type) {
    return {
      type: overrides.type,
      price: overrides.price || faker.number.float({ min: 0, max: 100000, precision: 0.01 }),
    };
  }

  // Otherwise, pick an unused type
  const availableTypes = serviceTypes.filter(t => !usedTypes.includes(t));
  const type = availableTypes.length > 0 ? availableTypes[0] : serviceTypes[0];
  usedTypes.push(type);

  return {
    type,
    price: faker.number.float({ min: 0, max: 100000, precision: 0.01 }),
  };
};

export default (overrides = {}) => createTypeOfService(overrides);
