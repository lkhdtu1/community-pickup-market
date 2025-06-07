import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';
import {
  getAllShops,
  getShopById,
  getProducerShops,
  createShop,
  updateShop,
  deleteShop
} from '../controllers/shop.controller';

const router = Router();

// Protected routes (for producers) - must come before parameterized routes
router.get('/my-shops', authenticate, checkRole([UserRole.PRODUCER]), getProducerShops);
router.post('/', authenticate, checkRole([UserRole.PRODUCER]), createShop);
router.put('/:id', authenticate, checkRole([UserRole.PRODUCER]), updateShop);
router.delete('/:id', authenticate, checkRole([UserRole.PRODUCER]), deleteShop);

// Public routes
router.get('/', getAllShops);
router.get('/:id', getShopById);

export default router;
