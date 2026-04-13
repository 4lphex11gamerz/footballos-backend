import {
  logMeal,
  getTodayDiet,
  getDietHistory,
  getDietRecommendations,
} from '../services/dietService.js';
import logger from '../utils/logger.js';

export const logMealController = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { mealName, calories, protein, carbs, fats, mealType } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!mealName || !calories || !protein || !carbs || !fats) {
      return res.status(400).json({
        success: false,
        message: 'All meal fields are required',
      });
    }

    const meal = await logMeal(userId, mealName, calories, protein, carbs, fats, mealType || 'BREAKFAST');

    res.status(201).json({
      success: true,
      message: 'Meal logged successfully',
      data: meal,
    });
  } catch (error) {
    logger.error('Log meal error', error);
    next(error);
  }
};

export const getTodayDietController = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const diet = await getTodayDiet(userId);

    res.status(200).json({
      success: true,
      data: diet,
    });
  } catch (error) {
    logger.error('Get today diet error', error);
    next(error);
  }
};

export const getDietHistoryController = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { daysBack = 30 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const history = await getDietHistory(userId, parseInt(daysBack));

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error('Get diet history error', error);
    next(error);
  }
};

export const getRecommendationsController = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const recommendations = await getDietRecommendations(userId);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('Get diet recommendations error', error);
    next(error);
  }
};
