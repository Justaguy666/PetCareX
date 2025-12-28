import { Router } from 'express';
import userController from './user.controller.js';

const router = Router();

router.get('/orders', userController.listOrders);
router.get('/appointments', userController.listAppointments);
router.get('/pets', userController.listPets);
router.post('/pets', userController.createPet);
router.put('/profile', userController.updateProfile);
router.get('/dashboard-stats', userController.getDashboardStats);

export default router;