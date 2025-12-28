import express from 'express';
import catalogController from './catalog.controller.js';

const router = express.Router();

router.get('/doctors', catalogController.getDoctors);
router.get('/vaccines', catalogController.getVaccines);
router.get('/vaccine-packages', catalogController.getVaccinePackages);

export default router;
