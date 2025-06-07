import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createPaymentIntent,
  confirmPaymentIntent,
  createCustomer,
  attachPaymentMethod,
  handleWebhook
} from '../controllers/payment.controller';

const router = Router();

// Create payment intent for order
router.post('/create-payment-intent', authenticate, createPaymentIntent);

// Confirm payment intent
router.post('/confirm-payment/:paymentIntentId', authenticate, confirmPaymentIntent);

// Create Stripe customer
router.post('/create-customer', authenticate, createCustomer);

// Attach payment method to customer
router.post('/attach-payment-method', authenticate, attachPaymentMethod);

// Stripe webhook handler (no auth required for webhooks)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
