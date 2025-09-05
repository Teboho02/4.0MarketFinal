import express from 'express';
import { 
  getProducts, 
  getProductsByCategory, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/api/products', getProducts);
router.get('/api/products/category/:category', getProductsByCategory);
router.get('/api/products/:id', getProductById);
router.post('/api/products', authenticateToken, createProduct);
router.put('/api/products/:id', authenticateToken, updateProduct);
router.delete('/api/products/:id', authenticateToken, deleteProduct);

export default router;