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
import {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} from '../controllers/paymentMethod.controller';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/address.controller';

const router = Router();

// Customer routes
router.get('/customer/profile', authenticate, authorize([UserRole.CUSTOMER]), getCustomerProfile);
router.put('/customer/profile', authenticate, authorize([UserRole.CUSTOMER]), updateCustomerProfile);
router.get('/customer/preferences', authenticate, authorize([UserRole.CUSTOMER]), getCustomerPreferences);
router.put('/customer/preferences', authenticate, authorize([UserRole.CUSTOMER]), updateCustomerPreferences);

// Customer payment methods
router.get('/customer/payment-methods', authenticate, authorize([UserRole.CUSTOMER]), getPaymentMethods);
router.post('/customer/payment-methods', authenticate, authorize([UserRole.CUSTOMER]), addPaymentMethod);
router.put('/customer/payment-methods/:id', authenticate, authorize([UserRole.CUSTOMER]), updatePaymentMethod);
router.delete('/customer/payment-methods/:id', authenticate, authorize([UserRole.CUSTOMER]), deletePaymentMethod);

// Customer addresses
router.get('/customer/addresses', authenticate, authorize([UserRole.CUSTOMER]), getAddresses);
router.post('/customer/addresses', authenticate, authorize([UserRole.CUSTOMER]), addAddress);
router.put('/customer/addresses/:id', authenticate, authorize([UserRole.CUSTOMER]), updateAddress);
router.delete('/customer/addresses/:id', authenticate, authorize([UserRole.CUSTOMER]), deleteAddress);

// Producer routes
router.get('/producer/profile', authenticate, authorize([UserRole.PRODUCER]), getProducerProfile);
router.put('/producer/profile', authenticate, authorize([UserRole.PRODUCER]), updateProducerProfile);
router.get('/producer/stats', authenticate, authorize([UserRole.PRODUCER]), getProducerStats);

export default router;
