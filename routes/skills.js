import express from 'express';
import { getSkills, addXP, logDrill, getProgress, getRecommendations } from '../controllers/skillController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/', authenticateToken, apiRateLimiter, getSkills);
router.post('/add-xp', authenticateToken, apiRateLimiter, addXP);
router.post('/log-drill', authenticateToken, apiRateLimiter, logDrill);
router.get('/progress', authenticateToken, apiRateLimiter, getProgress);
router.get('/recommendations', authenticateToken, apiRateLimiter, getRecommendations);

export default router;
