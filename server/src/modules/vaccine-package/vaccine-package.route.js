import { Router } from 'express';
import vaccinePackageController from './vaccine-package.controller.js';

const router = Router();

router.get('/', vaccinePackageController.getAllVaccinePackages);

export default router;
