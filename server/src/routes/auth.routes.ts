import { Router } from 'express';
import { register, login, getProfile, updateProfile, verifyToken, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/verify', authenticate, verifyToken);
router.post('/change-password', authenticate, changePassword);

export default router;