import { Router } from 'express';
import receptionistController from './receptionist.controller.js';

const router = Router();

router.get('/today-appointments', receptionistController.getTodayAppointments);
router.get('/appointments', receptionistController.getBranchAppointments);
router.put('/appointments/:id/checkin', receptionistController.checkinAppointment);
router.get('/customers/search', receptionistController.searchCustomers);
router.get('/customers/:customerId/pets', receptionistController.getCustomerPets);
router.get('/doctors', receptionistController.getAvailableDoctors);
router.get('/my-branch', receptionistController.getMyBranch);

export default router;
