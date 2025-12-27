import express from 'express';
import doctorController from './doctor.controller.js';
import roleMiddleware from '../../middlewares/role.middleware.js';

const router = express.Router();

// Only 'Bác sĩ thú y' can access these routes. 
router.use(roleMiddleware('Bác sĩ thú y'));

router.post('/exam-records', doctorController.createExamRecord);

export default router;
