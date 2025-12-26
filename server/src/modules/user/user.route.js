import { Router } from 'express';
import userController from './user.controller.js';

const router = Router();

router.post('/orders/buy', userController.buyProducts);

export default router;