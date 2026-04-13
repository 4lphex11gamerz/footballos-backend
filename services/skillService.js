import pool from '../config/database.js';
import logger from '../utils/logger.js';

export const getUserSkills = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT skill_name, skill_level, proficiency_percentage
       FROM skills
       WHERE user_id = $1
       ORDER BY skill_level DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get skills error', error);
    throw error;
  }
};

export const addSkillXP = async (userId, skillName, xpAmount) => {
  try {
    // Add XP to skill tracking (handled by trigger)
    const result = await pool.query(
      `UPDATE skills
       SET proficiency_percentage = proficiency_percentage + $1,
           updated_at = NOW()
       WHERE user_id = $2 AND skill_name = $3
       RETURNING skill_name, skill_level, proficiency_percentage`,
      [xpAmount * 0.5, userId, skillName]
    );

    if (result.rows.length === 0) {
      throw new Error('Skill not found');
    }

    logger.info('Skill XP added', { userId, skillName, xpAmount });

    return result.rows[0];
  } catch (error) {
    logger.error('Add skill XP error', error);
    throw error;
  }
};

export const logSkillDrill = async (userId, skillName, drillName, difficulty, completionTime) => {
  try {
    const result = await pool.query(
      `INSERT INTO skills (user_id, skill_name, proficiency_percentage)
       VALUES ($1, $2, (SELECT proficiency_percentage + 5 FROM skills 
                       WHERE user_id = $1 AND skill_name = $2))
       ON CONFLICT (user_id, skill_name) DO UPDATE
       SET proficiency_percentage = skills.proficiency_percentage + 5,
           updated_at = NOW()
       RETURNING skill_name, skill_level, proficiency_percentage`,
      [userId, skillName]
    );

    logger.info('Skill drill logged', { userId, skillName, drillName });

    return result.rows[0];
  } catch (error) {
    logger.error('Log skill drill error', error);
    throw error;
  }
};

export const getSkillProgress = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT skill_name, skill_level, proficiency_percentage,
              ROUND(proficiency_percentage / 5) as level_progress
       FROM skills
       WHERE user_id = $1
       ORDER BY skill_level DESC, proficiency_percentage DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get skill progress error', error);
    throw error;
  }
};

export const getSkillRecommendations = async (userId) => {
  try {
    // Get skills with lowest progress for recommendations
    const result = await pool.query(
      `SELECT skill_name, skill_level, proficiency_percentage
       FROM skills
       WHERE user_id = $1
       ORDER BY proficiency_percentage ASC
       LIMIT 3`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get skill recommendations error', error);
    throw error;
  }
};
