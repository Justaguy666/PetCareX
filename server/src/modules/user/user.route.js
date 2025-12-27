import { Router } from 'express';
import userController from './user.controller.js';

const router = Router();

router.get('/orders', userController.listOrders);
router.get('/appointments', userController.listAppointments);

export default router;