import {
  getWeeklyPlan,
  getTodayPlan,
  generateWeeklyPlan,
  getPlanHistory,
} from '../services/planService.js';
import logger from '../utils/logger.js';

export const getWeeklyPlanController = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const plan = await getWeeklyPlan(userId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'No active weekly plan found',
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error('Get weekly plan error', error);
    next(error);
  }
};

export const getTodayPlanController = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const plan = await getTodayPlan(userId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'No plan available for today',
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error('Get today plan error', error);
    next(error);
  }
};

export const generatePlan = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { difficulty = 'MEDIUM', planType = 'BALANCED' } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const plan = await generateWeeklyPlan(userId, difficulty, planType);

    res.status(201).json({
      success: true,
      message: 'Weekly plan generated successfully',
      data: plan,
    });
  } catch (error) {
    logger.error('Generate plan error', error);
    next(error);
  }
};

export const getPlanHistoryController = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const history = await getPlanHistory(userId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error('Get plan history error', error);
    next(error);
  }
};
