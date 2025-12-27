import { Router } from 'express';
import orderController from './order.controller.js';

const router = Router();

router.post('/buy', orderController.buy);

export default router;