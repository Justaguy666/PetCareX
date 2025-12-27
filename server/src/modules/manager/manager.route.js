import { Router } from 'express';
import managerController from './manager.controller.js';

const router = Router();

// [GET] /manager/statistics/revenue/:type - Get revenue statistics
router.get('/statistics/revenue/:type', managerController.getRevenueStatistics);

// [GET] /manager/statistics/appointments - Get the number of appointments
router.get('/statistics/appointments', managerController.getAppointmentStatistics);
router.get('/statistics/appointments/:branch_id', managerController.getAppointmentStatistics);

// [GET] /manager/statistics/products - Get revenue from products
router.get('/statistics/products', managerController.getProductRevenueStatistics);
router.get('/statistics/products/:branch_id', managerController.getProductRevenueStatistics);

export default router;