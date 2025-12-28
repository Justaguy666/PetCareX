import { Router } from 'express';
import doctorController from './doctor.controller.js';

const router = Router();

router.get('/assigned-pets', doctorController.getAssignedPets);
router.get('/today-appointments', doctorController.getTodayAppointments);
router.post('/exam-records', doctorController.createExamRecord);

export default router;
