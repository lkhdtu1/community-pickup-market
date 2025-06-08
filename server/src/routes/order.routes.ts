import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import {
  getProducerOrders,
  getCustomerOrders,
  createOrder,
  updateOrderStatus,
  getOrderStats
} from '../controllers/order.controller';

const router = Router();

// Customer routes
router.get('/customer', authenticate, authorize([UserRole.CUSTOMER]), getCustomerOrders);
router.post('/', authenticate, authorize([UserRole.CUSTOMER, UserRole.PRODUCER]), createOrder);

// Producer routes
router.get('/producer', authenticate, authorize([UserRole.PRODUCER]), getProducerOrders);
router.put('/:orderId/status', authenticate, authorize([UserRole.PRODUCER]), updateOrderStatus);
router.get('/producer/stats', authenticate, authorize([UserRole.PRODUCER]), getOrderStats);

export default router;
