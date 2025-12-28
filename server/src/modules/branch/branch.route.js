import { Router } from 'express';
import branchController from './branch.controller.js';

const router = Router();

// [GET] /branches - Get all branches
router.get('/', branchController.getBranches);

// [GET] /branches/:id - Get branch by ID
router.get('/:id', branchController.getBranchById);

// [POST] /branches - Create a new branch
router.post('/', branchController.createBranch);

// [PUT] /branches/:id - Update a branch
router.put('/:id', branchController.updateBranch);

// [DELETE] /branches/:id - Delete a branch
router.delete('/:id', branchController.deleteBranch);

export default router;