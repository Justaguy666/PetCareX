import { Router } from 'express';
import promotionController from './promotion.controller.js';

const router = Router();

router.get('/discount', promotionController.getDiscount);

export default router;
