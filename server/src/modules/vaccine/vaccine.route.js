import { Router } from 'express';
import vaccineController from './vaccine.controller.js';

const router = Router();

router.get('/', vaccineController.getAllVaccines);

export default router;
