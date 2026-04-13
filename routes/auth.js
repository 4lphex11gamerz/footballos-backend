import express from 'express';
import { register, login, verifyEmail, refreshToken, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/verify-email', verifyEmail);
router.post('/refresh-token', authenticateToken, refreshToken);
router.post('/logout', authenticateToken, logout);

export default router;
