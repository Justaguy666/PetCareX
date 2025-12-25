import { faker } from '@faker-js/faker';
import loadEnum from '../utils/enum.util.js';

const paymentMethods = loadEnum('payment-method');

const createInvoice = (overrides = {}) => {
  const totalAmount = overrides.total_amount ?? faker.number.float({ min: 100, max: 1000000, precision: 0.01 });
  const totalDiscount = overrides.total_discount ?? faker.number.float({ min: 0, max: totalAmount * 0.5, precision: 0.01 });
  
  const saleRating = overrides.sale_attitude_rating ?? (Math.random() > 0.5 ? faker.number.int({ min: 1, max: 5 }) : null);
  const overallRating = overrides.overall_satisfaction_rating ?? (Math.random() > 0.5 ? faker.number.int({ min: 1, max: 5 }) : null);
  
  return {
    created_by: overrides.created_by || faker.number.int({ min: 1, max: 1000000 }),
    branch_id: overrides.branch_id || faker.number.int({ min: 1, max: 1000000 }),
    customer_id: overrides.customer_id || faker.number.int({ min: 1, max: 1000000 }),
    payment_method: overrides.payment_method || faker.helpers.arrayElement(paymentMethods),
    sale_attitude_rating: saleRating,
    overall_satisfaction_rating: overallRating,
    total_amount: totalAmount,
    total_discount: totalDiscount,
  };
};

export default createInvoice;