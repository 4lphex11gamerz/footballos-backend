import {
  getUserSkills,
  addSkillXP,
  logSkillDrill,
  getSkillProgress,
  getSkillRecommendations,
} from '../services/skillService.js';
import logger from '../utils/logger.js';

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

export const addXP = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { skillName, xpAmount } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!skillName || !xpAmount) {
      return res.status(400).json({
        success: false,
        message: 'Skill name and XP amount are required',
      });
    }

    const skill = await addSkillXP(userId, skillName, xpAmount);

    res.status(200).json({
      success: true,
      message: 'XP added successfully',
      data: skill,
    });
  } catch (error) {
    logger.error('Add skill XP error', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const logDrill = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { skillName, drillName, difficulty, completionTime } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!skillName || !drillName) {
      return res.status(400).json({
        success: false,
        message: 'Skill name and drill name are required',
      });
    }

    const drill = await logSkillDrill(userId, skillName, drillName, difficulty, completionTime);

    res.status(201).json({
      success: true,
      message: 'Skill drill logged successfully',
      data: drill,
    });
  } catch (error) {
    logger.error('Log skill drill error', error);
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const progress = await getSkillProgress(userId);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    logger.error('Get skill progress error', error);
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const recommendations = await getSkillRecommendations(userId);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('Get skill recommendations error', error);
    next(error);
  }
};
