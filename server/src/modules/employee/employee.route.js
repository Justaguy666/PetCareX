import { Router } from 'express';
import employeeController from './employee.controller.js';

const router = Router();

// [POST] /employee/appointment - Create a new appointment
router.post('/appointment', employeeController.createAppointment);

// [GET] /employee/pets/:petId - Get pet details by ID
router.get('/pets/:petId', employeeController.getPetById);

export default router;