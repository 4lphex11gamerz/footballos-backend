import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import redis from '../config/redis.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

export const registerUser = async (email, password, firstName, lastName, position) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if user exists
    const existingUser = await client.query(
      'SELECT id FROM user_profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await client.query(
      `INSERT INTO user_profiles (email, password_hash, first_name, last_name, position, email_verified)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, email, subscription_status`,
      [email, hashedPassword, firstName, lastName, position]
    );

    const userId = userResult.rows[0].id;

    // Create default player card
    await client.query(
      `SELECT create_default_player_card($1)`,
      [userId]
    );

    // Create default skills
    await client.query(
      `SELECT create_default_skills_for_user($1)`,
      [userId]
    );

    // Create default subscription (FREE)
    await client.query(
      `SELECT create_default_subscription($1)`,
      [userId]
    );

    // Create today's checklist
    await client.query(
      `SELECT create_default_daily_checklist($1, CURRENT_DATE)`,
      [userId]
    );

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await client.query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, verificationToken, tokenExpiry]
    );

    await client.query('COMMIT');

    logger.info('User registered successfully', { userId, email });

    return {
      userId,
      email: userResult.rows[0].email,
      verificationToken,
      subscription_status: userResult.rows[0].subscription_status,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Registration error', error);
    throw error;
  } finally {
    client.release();
  }
};

export const loginUser = async (email, password) => {
  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, email_verified, subscription_status
       FROM user_profiles
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    if (!user.email_verified) {
      throw new Error('Email not verified');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken(user.id, user.email, user.subscription_status);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in Redis (7 day TTL)
    await redis.setex(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60,
      refreshToken
    );

    logger.info('User logged in successfully', { userId: user.id, email });

    return {
      userId: user.id,
      email: user.email,
      accessToken,
      refreshToken,
      subscription_status: user.subscription_status,
    };
  } catch (error) {
    logger.error('Login error', error);
    throw error;
  }
};

export const verifyEmailToken = async (token) => {
  try {
    const result = await pool.query(
      `SELECT user_id FROM email_verification_tokens
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired verification token');
    }

    const userId = result.rows[0].user_id;

    // Update user email verified
    await pool.query(
      'UPDATE user_profiles SET email_verified = true WHERE id = $1',
      [userId]
    );

    // Delete token
    await pool.query(
      'DELETE FROM email_verification_tokens WHERE token = $1',
      [token]
    );

    logger.info('Email verified successfully', { userId });

    return { userId };
  } catch (error) {
    logger.error('Email verification error', error);
    throw error;
  }
};

export const refreshAccessToken = async (userId, refreshToken) => {
  try {
    // Check if refresh token exists in Redis
    const storedToken = await redis.get(`refresh_token:${userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Get user details
    const result = await pool.query(
      'SELECT email, subscription_status FROM user_profiles WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Generate new tokens
    const newAccessToken = generateAccessToken(userId, user.email, user.subscription_status);
    const newRefreshToken = generateRefreshToken(userId);

    // Update refresh token in Redis
    await redis.setex(
      `refresh_token:${userId}`,
      7 * 24 * 60 * 60,
      newRefreshToken
    );

    logger.info('Access token refreshed successfully', { userId });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    logger.error('Token refresh error', error);
    throw error;
  }
};

export const logoutUser = async (userId) => {
  try {
    // Remove refresh token from Redis
    await redis.del(`refresh_token:${userId}`);

    logger.info('User logged out successfully', { userId });

    return { success: true };
  } catch (error) {
    logger.error('Logout error', error);
    throw error;
  }
};
