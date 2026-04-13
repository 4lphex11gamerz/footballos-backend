import pool from '../config/database.js';
import logger from '../utils/logger.js';

export const getUserProfile = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT up.id, up.email, up.first_name, up.last_name, up.position, 
              up.current_level, up.subscription_status, up.created_at,
              pc.overall_rating, pc.total_xp, pc.pace, pc.shooting, pc.passing,
              pc.dribbling, pc.defense, pc.physical,
              sub.plan_type, sub.created_at as subscription_date
       FROM user_profiles up
       LEFT JOIN player_cards pc ON up.id = pc.user_id
       LEFT JOIN subscriptions sub ON up.id = sub.user_id
       WHERE up.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get user profile error', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const { first_name, last_name, position } = updates;

    const result = await pool.query(
      `UPDATE user_profiles 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           position = COALESCE($3, position),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, first_name, last_name, position, subscription_status`,
      [first_name, last_name, position, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info('User profile updated', { userId });

    return result.rows[0];
  } catch (error) {
    logger.error('Update user profile error', error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT up.id, pc.overall_rating, pc.total_xp, pc.current_level,
              pc.pace, pc.shooting, pc.passing, pc.dribbling, pc.defense, pc.physical
       FROM user_profiles up
       LEFT JOIN player_cards pc ON up.id = pc.user_id
       WHERE up.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get user stats error', error);
    throw error;
  }
};

export const getUserLeaderboard = async (limit = 100, offset = 0) => {
  try {
    const result = await pool.query(
      `SELECT up.id, up.first_name, up.last_name, up.position,
              pc.overall_rating, pc.total_xp, pc.current_level,
              ROW_NUMBER() OVER (ORDER BY pc.overall_rating DESC) as rank
       FROM player_cards pc
       JOIN user_profiles up ON pc.user_id = up.id
       ORDER BY pc.overall_rating DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get leaderboard error', error);
    throw error;
  }
};

export const getUserAchievements = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT xp_category, SUM(xp_amount) as total_xp
       FROM xp_logs
       WHERE user_id = $1
       GROUP BY xp_category
       ORDER BY total_xp DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get achievements error', error);
    throw error;
  }
};

export const getUserSkills = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT skill_name, skill_level, proficiency_percentage, created_at, updated_at
       FROM skills
       WHERE user_id = $1
       ORDER BY skill_level DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get user skills error', error);
    throw error;
  }
};
