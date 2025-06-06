import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerPreferences,
  updateCustomerPreferences
} from '../controllers/customer.controller';
import {
  getProducerProfile,
  updateProducerProfile,
  getProducerStats
} from '../controllers/producer.controller';

const router = Router();

// Customer routes
router.get('/customer/profile', authenticate, authorize([UserRole.CUSTOMER]), getCustomerProfile);
router.put('/customer/profile', authenticate, authorize([UserRole.CUSTOMER]), updateCustomerProfile);
router.get('/customer/preferences', authenticate, authorize([UserRole.CUSTOMER]), getCustomerPreferences);
router.put('/customer/preferences', authenticate, authorize([UserRole.CUSTOMER]), updateCustomerPreferences);

// Producer routes
router.get('/producer/profile', authenticate, authorize([UserRole.PRODUCER]), getProducerProfile);
router.put('/producer/profile', authenticate, authorize([UserRole.PRODUCER]), updateProducerProfile);
router.get('/producer/stats', authenticate, authorize([UserRole.PRODUCER]), getProducerStats);

export default router;
