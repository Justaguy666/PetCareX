import express from 'express';
import searchController from './search.controller.js';

const router = express.Router();

router.get('/', searchController.search);

export default router;
