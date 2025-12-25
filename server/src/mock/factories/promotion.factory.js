import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const promotionApplies = loadEnum('promotion-for-level');

export default (overrides = {}) => ({
    description: overrides.description || faker.lorem.sentence(),
    apply_for: overrides.apply_for || faker.helpers.arrayElement(promotionApplies),
});
