import { Router } from 'express';
import petController from './pet.controller.js';

const router = Router();

// [GET] /pets - List all pets
router.get('/', petController.getPets);

// [GET] /pets/:petId - Get pet by ID
router.get('/:petId', petController.getPetById);

export default router;