import { registerUser, loginUser, verifyEmailToken, refreshAccessToken, logoutUser } from '../services/authService.js';
import { validateEmail, validatePassword, validatePosition } from '../utils/validators.js';
import logger from '../utils/logger.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, position } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !position) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      });
    }

    if (!validatePosition(position)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid position. Must be GK, DEF, MID, or FWD',
      });
    }

    const user = await registerUser(email, password, firstName, lastName, position);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        userId: user.userId,
        email: user.email,
        verificationRequired: true,
      },
    });
  } catch (error) {
    logger.error('Register error', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: result.userId,
        email: result.email,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        subscription_status: result.subscription_status,
      },
    });
  } catch (error) {
    logger.error('Login error', error);
    if (error.message.includes('not verified') || error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    const result = await verifyEmailToken(token);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        userId: result.userId,
      },
    });
  } catch (error) {
    logger.error('Email verification error', error);
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.userId;

    if (!refreshToken || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token and user ID are required',
      });
    }

    const result = await refreshAccessToken(userId, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    logger.error('Token refresh error', error);
    if (error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    await logoutUser(userId);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error', error);
    next(error);
  }
};
