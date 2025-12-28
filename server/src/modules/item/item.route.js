import { Router } from 'express';
import itemController from './item.controller.js';

const router = Router();

router.get('/', itemController.getAllItems);

export default router;
