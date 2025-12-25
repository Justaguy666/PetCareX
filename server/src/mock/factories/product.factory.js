import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const productTypes = loadEnum('product-type');

export const createProduct = (overrides = {}) => ({
  product_name: overrides.product_name || faker.commerce.productName(),
  product_type: overrides.product_type || faker.helpers.arrayElement(productTypes),
  price: overrides.price || faker.number.float({ min: 0, max: 100000, precision: 0.01 }),
});

export default (overrides = {}) => ({
  ...createProduct(overrides),
});
