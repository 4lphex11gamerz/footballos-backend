import pool from '../config/database.js';
import logger from '../utils/logger.js';

export const getWeeklyPlan = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT id, week_start_date, week_end_date, plan_name, difficulty
       FROM weekly_plans
       WHERE user_id = $1 AND week_start_date <= CURRENT_DATE AND week_end_date >= CURRENT_DATE
       ORDER BY week_start_date DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const weeklyPlan = result.rows[0];

    // Get daily focus for each day of the plan
    const daysResult = await pool.query(
      `SELECT day_of_week, focus_area, difficulty, target_duration
       FROM daily_focus
       WHERE weekly_plan_id = $1
       ORDER BY day_of_week ASC`,
      [weeklyPlan.id]
    );

    return {
      ...weeklyPlan,
      days: daysResult.rows,
    };
  } catch (error) {
    logger.error('Get weekly plan error', error);
    throw error;
  }
};

export const getTodayPlan = async (userId) => {
  try {
    // Get current week's plan
    const planResult = await pool.query(
      `SELECT id FROM weekly_plans
       WHERE user_id = $1 AND week_start_date <= CURRENT_DATE AND week_end_date >= CURRENT_DATE`,
      [userId]
    );

    if (planResult.rows.length === 0) {
      return null;
    }

    const weeklyPlanId = planResult.rows[0].id;
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

    // Get today's focus
    const focusResult = await pool.query(
      `SELECT focus_area, difficulty, target_duration, exercises
       FROM daily_focus
       WHERE weekly_plan_id = $1 AND day_of_week = $2`,
      [weeklyPlanId, dayOfWeek]
    );

    if (focusResult.rows.length === 0) {
      return null;
    }

    return focusResult.rows[0];
  } catch (error) {
    logger.error('Get today plan error', error);
    throw error;
  }
};

export const generateWeeklyPlan = async (userId, difficulty = 'MEDIUM', planType = 'BALANCED') => {
  try {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const result = await pool.query(
      `INSERT INTO weekly_plans (user_id, week_start_date, week_end_date, plan_name, difficulty, plan_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, plan_name, difficulty`,
      [userId, weekStart, weekEnd, `Weekly ${planType} Plan`, difficulty, planType]
    );

    const planId = result.rows[0].id;

    // Generate daily focus for 7 days
    const focuses = ['Football', 'Strength', 'Agility', 'Recovery', 'Speed', 'Tactical', 'Endurance'];

    for (let i = 0; i < 7; i++) {
      const dayOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i];
      const focusArea = focuses[i];

      await pool.query(
        `INSERT INTO daily_focus (weekly_plan_id, day_of_week, focus_area, difficulty, target_duration)
         VALUES ($1, $2, $3, $4, $5)`,
        [planId, dayOfWeek, focusArea, difficulty, 60]
      );
    }

    logger.info('Weekly plan generated', { userId, planId });

    return result.rows[0];
  } catch (error) {
    logger.error('Generate weekly plan error', error);
    throw error;
  }
};

export const getPlanHistory = async (userId, limit = 10) => {
  try {
    const result = await pool.query(
      `SELECT id, week_start_date, week_end_date, plan_name, difficulty
       FROM weekly_plans
       WHERE user_id = $1
       ORDER BY week_end_date DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get plan history error', error);
    throw error;
  }
};
