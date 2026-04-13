import express from 'express';
import {
  startWorkout,
  endWorkout,
  getHistory,
  getWeeklyStats,
  logExercise,
  getStats,
} from '../controllers/workoutController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/start', authenticateToken, apiRateLimiter, startWorkout);
router.put('/:sessionId/end', authenticateToken, apiRateLimiter, endWorkout);
router.get('/history', authenticateToken, apiRateLimiter, getHistory);
router.get('/week-stats', authenticateToken, apiRateLimiter, getWeeklyStats);
router.get('/stats', authenticateToken, apiRateLimiter, getStats);
router.post('/:sessionId/exercise', authenticateToken, apiRateLimiter, logExercise);

export default router;
