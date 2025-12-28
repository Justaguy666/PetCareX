import { Router } from 'express';
import salesController from './sales.controller.js';

const router = Router();

router.get('/my-branch', salesController.getMyBranch);
router.get('/inventory', salesController.getBranchInventory);
router.put('/inventory/update', salesController.updateStock);
router.put('/inventory/adjust', salesController.adjustStock);
router.get('/today-sales', salesController.getTodaySales);
router.get('/stats', salesController.getSalesStats);
router.get('/service-invoices', salesController.getPendingServiceInvoices);

export default router;
