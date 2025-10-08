import express from 'express';
import {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats
} from '../controllers/suppliersController.js';
import { verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.get('/', getSuppliers);
router.get('/stats', getSupplierStats);
router.get('/:id', getSupplier);

// Protected routes (require authentication)
router.post('/', verifyToken, createSupplier);
router.put('/:id', verifyToken, updateSupplier);
router.delete('/:id', verifyToken, deleteSupplier);

export default router;