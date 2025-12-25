import { faker } from '@faker-js/faker';

export default (overrides = {}) => ({
  medical_examination_id: overrides.medical_examination_id ?? faker.number.int({ min: 1, max: 1000000 }),
  medicine_id: overrides.medicine_id ?? faker.number.int({ min: 1, max: 1000000 }),
  quantity: overrides.quantity || faker.number.int({ min: 1, max: 100 }),
  dosage: overrides.dosage || `${faker.number.int({ min: 1, max: 3 })} lần/ngày`,
  duration: overrides.duration || `${faker.number.int({ min: 1, max: 30 })} ngày`,
  instructions: overrides.instructions || faker.lorem.sentence(),
});
