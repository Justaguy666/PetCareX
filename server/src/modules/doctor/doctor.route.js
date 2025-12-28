import { Router } from 'express';
import doctorController from './doctor.controller.js';

const router = Router();

router.get('/assigned-pets', doctorController.getAssignedPets);
router.get('/today-appointments', doctorController.getTodayAppointments);
router.post('/exam-records', doctorController.createExamRecord);
router.get('/vaccine-inventory', doctorController.getVaccineInventory);
router.get('/medicines', doctorController.getMedicines);
router.get('/package-inventory', doctorController.getPackageInventory);
router.post('/single-injection', doctorController.createSingleInjection);
router.post('/package-injection', doctorController.createPackageInjection);
router.put('/appointments/:id/confirm', doctorController.confirmAppointment);
router.put('/appointments/:id/cancel', doctorController.cancelAppointment);
router.get('/pending-count', doctorController.getPendingCount);
router.get('/pets/:petId/medical-records', doctorController.getMedicalRecordsByPet);
router.get('/pets/:petId/full-history', doctorController.getPetFullHistory);
router.get('/pets-by-type/:serviceType', doctorController.getPetsByAppointmentType);

export default router;
