import { Router } from 'express';
import branchController from './branch.controller.js';

const router = Router();

// [GET] /branches - Get all branches
router.get('/', branchController.getBranches);

// [GET] /branches/:id - Get branch by ID
router.get('/:id', branchController.getBranchById);

export default router;