import pool from '../config/database.js';
import logger from '../utils/logger.js';

export const startWorkoutSession = async (userId, duration, intensity, calories_burned) => {
  try {
    const result = await pool.query(
      `INSERT INTO workout_sessions (user_id, duration_minutes, intensity, calories_burned, started_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, user_id, duration_minutes, intensity, calories_burned, started_at`,
      [userId, duration, intensity, calories_burned]
    );

    logger.info('Workout session started', { userId, sessionId: result.rows[0].id });

    return result.rows[0];
  } catch (error) {
    logger.error('Start workout session error', error);
    throw error;
  }
};

export const endWorkoutSession = async (sessionId, userId) => {
  try {
    const result = await pool.query(
      `UPDATE workout_sessions
       SET ended_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, duration_minutes, intensity, calories_burned`,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Workout session not found');
    }

    // Calculate and award XP based on intensity and duration
    const session = result.rows[0];
    let baseXP = 100 + (session.duration_minutes * 5);
    
    if (session.intensity === 'HIGH') baseXP *= 1.5;
    if (session.intensity === 'EXTREME') baseXP *= 2;

    // Award XP
    await awardXP(userId, 'WORKOUT', Math.round(baseXP));

    logger.info('Workout session ended', { sessionId, userId });

    return result.rows[0];
  } catch (error) {
    logger.error('End workout session error', error);
    throw error;
  }
};

export const getWorkoutHistory = async (userId, daysBack = 30) => {
  try {
    const result = await pool.query(
      `SELECT id, duration_minutes, intensity, calories_burned, started_at, ended_at
       FROM workout_sessions
       WHERE user_id = $1 AND started_at >= NOW() - INTERVAL '${daysBack} days'
       ORDER BY started_at DESC
       LIMIT 100`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get workout history error', error);
    throw error;
  }
};

export const getWeeklyWorkouts = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT id, duration_minutes, intensity, calories_burned, started_at
       FROM workout_sessions
       WHERE user_id = $1 AND started_at >= NOW() - INTERVAL '7 days'
       ORDER BY started_at DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get weekly workouts error', error);
    throw error;
  }
};

export const logWorkoutExercise = async (sessionId, userId, exerciseName, sets, reps, weight, formRating) => {
  try {
    const result = await pool.query(
      `INSERT INTO workout_exercises (session_id, exercise_name, sets, reps, weight, form_rating)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, exercise_name, sets, reps, weight, form_rating`,
      [sessionId, exerciseName, sets, reps, weight, formRating]
    );

    logger.info('Exercise logged', { sessionId, exerciseName });

    return result.rows[0];
  } catch (error) {
    logger.error('Log exercise error', error);
    throw error;
  }
};

export const awardXP = async (userId, category, xpAmount) => {
  try {
    const result = await pool.query(
      `INSERT INTO xp_logs (user_id, xp_category, xp_amount, earned_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, xp_amount, xp_category`,
      [userId, category, xpAmount]
    );

    // Update total XP in player_cards
    await pool.query(
      `UPDATE player_cards
       SET total_xp = total_xp + $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [xpAmount, userId]
    );

    logger.info('XP awarded', { userId, category, xpAmount });

    return result.rows[0];
  } catch (error) {
    logger.error('Award XP error', error);
    throw error;
  }
};

export const getWorkoutStats = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_workouts,
        SUM(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60) as total_minutes,
        SUM(calories_burned) as total_calories,
        AVG(duration_minutes) as avg_duration
       FROM workout_sessions
       WHERE user_id = $1 AND ended_at IS NOT NULL`,
      [userId]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Get workout stats error', error);
    throw error;
  }
};
