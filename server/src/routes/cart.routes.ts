import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as cartController from '../controllers/cart.controller';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Get cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/add', cartController.addToCart);

// Update cart item quantity
router.put('/items/:productId', cartController.updateCartItemQuantity);

// Remove item from cart
router.delete('/items/:productId', cartController.removeFromCart);

// Clear cart
router.delete('/', cartController.clearCart);

// Sync cart (merge localStorage with database)
router.post('/sync', cartController.syncCart);

export default router;
