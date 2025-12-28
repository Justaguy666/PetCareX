import db from '../../config/db.js';
import * as Q from './promotion.query.js';

class PromotionRepo {
  getDiscountForUser = async (userId, serviceType) => {
    const userResult = await db.query(Q.GET_USER_MEMBERSHIP, [userId]);
    const membershipLevel = userResult.rows[0]?.membership_level || 'Cơ bản';

    const result = await db.query(Q.GET_DISCOUNT_FOR_SERVICE, [serviceType, membershipLevel]);
    
    return {
      discount_percentage: result.rows[0]?.discount_percentage || 0,
      membership_level: membershipLevel
    };
  };
}

export default new PromotionRepo();
