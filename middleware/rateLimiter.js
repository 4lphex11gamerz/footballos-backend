import redis from '../config/redis.js';
import logger from '../utils/logger.js';

const rateLimitStore = new Map();

const getClientIp = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

const getRateLimitKey = (ip, endpoint) => {
  return `rate_limit:${ip}:${endpoint}`;
};

const resetRateLimit = async (key, windowMs) => {
  try {
    await redis.del(key);
  } catch (error) {
    logger.warn('Failed to reset rate limit in Redis', error);
  }
};

export const createRateLimiter = (windowMs = 60000, maxRequests = 100) => {
  return async (req, res, next) => {
    try {
      const ip = getClientIp(req);
      const endpoint = `${req.method}:${req.path}`;
      const key = getRateLimitKey(ip, endpoint);

      // Try Redis first
      let count = 0;
      try {
        const redisCount = await redis.get(key);
        count = redisCount ? parseInt(redisCount) : 0;

        if (count >= maxRequests) {
          return res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later',
          });
        }

        await redis.incr(key);
        await redis.expire(key, Math.ceil(windowMs / 1000));
      } catch (redisError) {
        logger.warn('Redis rate limit failed, falling back to memory', redisError);

        // Fallback to in-memory rate limiting
        if (!rateLimitStore.has(key)) {
          rateLimitStore.set(key, { count: 0, resetTime: Date.now() + windowMs });
        }

        const rateData = rateLimitStore.get(key);

        if (Date.now() > rateData.resetTime) {
          rateData.count = 0;
          rateData.resetTime = Date.now() + windowMs;
        }

        if (rateData.count >= maxRequests) {
          return res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later',
          });
        }

        rateData.count++;
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error', error);
      next();
    }
  };
};

// Specific rate limiters
export const authRateLimiter = createRateLimiter(5 * 60 * 1000, 5); // 5 requests per 5 minutes
export const generalRateLimiter = createRateLimiter(60 * 1000, 100); // 100 requests per minute
export const apiRateLimiter = createRateLimiter(60 * 1000, 50); // 50 requests per minute
