import {
  startWorkoutSession,
  endWorkoutSession,
  getWorkoutHistory,
  getWeeklyWorkouts,
  logWorkoutExercise,
  getWorkoutStats,
} from '../services/workoutService.js';
import { validateWorkoutIntensity } from '../utils/validators.js';
import logger from '../utils/logger.js';

export const startWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { duration, intensity, calories_burned } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!duration || !intensity) {
      return res.status(400).json({
        success: false,
        message: 'Duration and intensity are required',
      });
    }

    if (!validateWorkoutIntensity(intensity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid intensity. Must be LOW, MEDIUM, HIGH, or EXTREME',
      });
    }

    const session = await startWorkoutSession(userId, duration, intensity, calories_burned || 0);

    res.status(201).json({
      success: true,
      message: 'Workout session started',
      data: session,
    });
  } catch (error) {
    logger.error('Start workout error', error);
    next(error);
  }
};

export const endWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const session = await endWorkoutSession(sessionId, userId);

    res.status(200).json({
      success: true,
      message: 'Workout session ended',
      data: session,
    });
  } catch (error) {
    logger.error('End workout error', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { daysBack = 30 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const history = await getWorkoutHistory(userId, parseInt(daysBack));

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error('Get workout history error', error);
    next(error);
  }
};

export const getWeeklyStats = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const weeklyWorkouts = await getWeeklyWorkouts(userId);

    res.status(200).json({
      success: true,
      data: weeklyWorkouts,
    });
  } catch (error) {
    logger.error('Get weekly stats error', error);
    next(error);
  }
};

export const logExercise = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;
    const { exerciseName, sets, reps, weight, formRating } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!sessionId || !exerciseName) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and exercise name are required',
      });
    }

    const exercise = await logWorkoutExercise(sessionId, userId, exerciseName, sets, reps, weight, formRating);

    res.status(201).json({
      success: true,
      message: 'Exercise logged successfully',
      data: exercise,
    });
  } catch (error) {
    logger.error('Log exercise error', error);
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const stats = await getWorkoutStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get workout stats error', error);
    next(error);
  }
};
