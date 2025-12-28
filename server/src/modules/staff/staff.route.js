import { Router } from 'express';
import staffController from './staff.controller.js';

const router = Router();

router.get('/', staffController.getAllStaff);
router.post('/', staffController.createStaff);
// Placeholder for future PUT and DELETE routes
// router.put('/:id', staffController.updateStaff);
// router.delete('/:id', staffController.deleteStaff);

export default router;
