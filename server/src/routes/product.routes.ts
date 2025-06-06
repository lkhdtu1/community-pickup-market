import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import {
  getAllProducts,
  getProductById,
  getProducerProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller';

const router = Router();

// Public routes (for customers)
router.get('/', getAllProducts);

// Protected routes (for producers) - specific routes before parameterized ones
router.get('/my-products', authenticate, authorize([UserRole.PRODUCER]), getProducerProducts);
router.post('/', authenticate, authorize([UserRole.PRODUCER]), createProduct);
router.put('/:id', authenticate, authorize([UserRole.PRODUCER]), updateProduct);
router.delete('/:id', authenticate, authorize([UserRole.PRODUCER]), deleteProduct);

// Parameterized routes last to avoid conflicts
router.get('/:id', getProductById);

export default router; 