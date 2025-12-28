import express from 'express';
import productController from './product.controller.js';

const router = express.Router();

router.get('/', productController.listProducts);

export default router;
