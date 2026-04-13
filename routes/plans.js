import express from 'express';
import {
  getWeeklyPlanController,
  getTodayPlanController,
  generatePlan,
  getPlanHistoryController,
} from '../controllers/planController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/weekly', authenticateToken, apiRateLimiter, getWeeklyPlanController);
router.get('/today', authenticateToken, apiRateLimiter, getTodayPlanController);
router.post('/generate', authenticateToken, apiRateLimiter, generatePlan);
router.get('/history', authenticateToken, apiRateLimiter, getPlanHistoryController);

export default router;
