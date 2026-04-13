import { verifyAccessToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication middleware error', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error', error);
    next();
  }
};
