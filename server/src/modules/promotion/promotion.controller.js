import promotionRepo from './promotion.repo.js';

class PromotionController {
  getDiscount = async (req, res) => {
    const { service_type } = req.query;
    const userId = req.account?.user_id;
    
    // Get user's membership level and discount
    const result = await promotionRepo.getDiscountForUser(userId, service_type || 'Mua hàng');
    
    return res.status(200).json({
      data: {
        discount_percentage: result.discount_percentage,
        membership_level: result.membership_level
      }
    });
  };
}

export default new PromotionController();
