import express from 'express';
import {
  logMealController,
  getTodayDietController,
  getDietHistoryController,
  getRecommendationsController,
} from '../controllers/dietController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/log-meal', authenticateToken, apiRateLimiter, logMealController);
router.get('/today', authenticateToken, apiRateLimiter, getTodayDietController);
router.get('/history', authenticateToken, apiRateLimiter, getDietHistoryController);
router.get('/recommendations', authenticateToken, apiRateLimiter, getRecommendationsController);

export default router;
