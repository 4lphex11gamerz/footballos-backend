import express from 'express';
import { getProfile, updateProfile, getStats, getLeaderboard, getAchievements, getSkills } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/profile', authenticateToken, apiRateLimiter, getProfile);
router.put('/profile', authenticateToken, apiRateLimiter, updateProfile);
router.get('/stats', authenticateToken, apiRateLimiter, getStats);
router.get('/achievements', authenticateToken, apiRateLimiter, getAchievements);
router.get('/skills', authenticateToken, apiRateLimiter, getSkills);
router.get('/leaderboard', apiRateLimiter, getLeaderboard);

export default router;
