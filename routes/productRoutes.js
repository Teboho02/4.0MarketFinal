// routes/productRoutes.js
import express from 'express';
import {
  getProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { verifyToken } from '../controllers/authController.js';

import { uploadMultiple } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/products', getProducts);
router.get('/products/category/:category', getProductsByCategory);
router.get('/products/:id', getProductById);

// Protected routes (admin only)
router.post('/products', verifyToken, uploadMultiple, createProduct);
router.put('/products/:id', verifyToken, uploadMultiple, updateProduct);
router.delete('/products/:id', verifyToken, deleteProduct);

export default router;