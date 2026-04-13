import pool from '../config/database.js';
import logger from '../utils/logger.js';

export const logMeal = async (userId, mealName, calories, protein, carbs, fats, mealType) => {
  try {
    const result = await pool.query(
      `INSERT INTO daily_diet (user_id, meal_date, meal_name, calories, protein, carbs, fats, meal_type)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7)
       RETURNING id, meal_name, calories, protein, carbs, fats`,
      [userId, mealName, calories, protein, carbs, fats, mealType]
    );

    logger.info('Meal logged', { userId, mealName });

    return result.rows[0];
  } catch (error) {
    logger.error('Log meal error', error);
    throw error;
  }
};

export const getTodayDiet = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT meal_name, calories, protein, carbs, fats, meal_type, created_at
       FROM daily_diet
       WHERE user_id = $1 AND meal_date = CURRENT_DATE
       ORDER BY created_at DESC`,
      [userId]
    );

    // Calculate totals
    const totals = result.rows.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return {
      meals: result.rows,
      totals,
    };
  } catch (error) {
    logger.error('Get today diet error', error);
    throw error;
  }
};

export const getDietHistory = async (userId, daysBack = 30) => {
  try {
    const result = await pool.query(
      `SELECT meal_date, SUM(calories) as total_calories,
              SUM(protein) as total_protein, SUM(carbs) as total_carbs,
              SUM(fats) as total_fats
       FROM daily_diet
       WHERE user_id = $1 AND meal_date >= CURRENT_DATE - INTERVAL '${daysBack} days'
       GROUP BY meal_date
       ORDER BY meal_date DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get diet history error', error);
    throw error;
  }
};

export const getDietRecommendations = async (userId) => {
  try {
    // Get user profile for recommendations based on position
    const userResult = await pool.query(
      'SELECT position FROM user_profiles WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const position = userResult.rows[0].position;

    // Simple recommendations based on position
    const recommendations = {
      GK: [
        { meal: 'Grilled chicken breast', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
        { meal: 'Brown rice', calories: 111, protein: 2.6, carbs: 23, fats: 0.9 },
        { meal: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4 },
      ],
      DEF: [
        { meal: 'Salmon fillet', calories: 280, protein: 30, carbs: 0, fats: 17 },
        { meal: 'Sweet potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
        { meal: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
      ],
      MID: [
        { meal: 'Lean beef', calories: 250, protein: 26, carbs: 0, fats: 15 },
        { meal: 'Quinoa', calories: 120, protein: 4.4, carbs: 21, fats: 1.9 },
        { meal: 'Asparagus', calories: 20, protein: 2.2, carbs: 3.7, fats: 0.1 },
      ],
      FWD: [
        { meal: 'Turkey breast', calories: 165, protein: 29, carbs: 0, fats: 3.6 },
        { meal: 'White rice', calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
        { meal: 'Green beans', calories: 31, protein: 1.8, carbs: 7, fats: 0.1 },
      ],
    };

    return recommendations[position] || recommendations.MID;
  } catch (error) {
    logger.error('Get diet recommendations error', error);
    throw error;
  }
};
