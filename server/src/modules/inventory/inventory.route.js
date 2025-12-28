import { Router } from 'express';
import inventoryController from './inventory.controller.js';

const router = Router();

// Corresponds to the frontend's call to /inventory/branch
router.get('/branch', inventoryController.getAllBranchInventory);

export default router;
