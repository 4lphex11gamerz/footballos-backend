import {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getUserLeaderboard,
  getUserAchievements,
  getUserSkills,
} from '../services/userService.js';
import logger from '../utils/logger.js';

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const profile = await getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error('Get profile error', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { first_name, last_name, position } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const updated = await updateUserProfile(userId, { first_name, last_name, position });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  } catch (error) {
    logger.error('Update profile error', error);
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

    const stats = await getUserStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get stats error', error);
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const leaderboard = await getUserLeaderboard(parseInt(limit), parseInt(offset));

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    logger.error('Get leaderboard error', error);
    next(error);
  }
};

export const getAchievements = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const achievements = await getUserAchievements(userId);

    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    logger.error('Get achievements error', error);
    next(error);
  }
};

export const getSkills = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const skills = await getUserSkills(userId);

    res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    logger.error('Get skills error', error);
    next(error);
  }
};
