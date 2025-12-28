import { Router } from 'express';
import appointmentController from './appointment.controller.js';

const router = Router();

router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.listAppointments);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.cancelAppointment);
//router.get('/:appointmentId', appointmentController.getAppointment);

export default router;
