import { redisClient } from "@/configs/redis";
import { logger } from "@/lib/logger";

const RATE_LIMIT_PREFIX = "rate_limit:";
const DEFAULT_WINDOW = 60; // 60 seconds sliding window

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a webhook request is within rate limit using sliding window
 * @param webhookId - The webhook ID
 * @param limit - Maximum requests per window (from webhook.rateLimit)
 * @param windowSeconds - Time window in seconds (default: 60)
 */
export async function checkRateLimit(
  webhookId: string,
  limit: number | null,
  windowSeconds: number = DEFAULT_WINDOW
): Promise<RateLimitResult> {
  // If no rate limit configured, allow all requests
  if (!limit || limit <= 0) {
    return {
      allowed: true,
      remaining: Number.POSITIVE_INFINITY,
      resetAt: 0,
    };
  }

  try {
    const key = `${RATE_LIMIT_PREFIX}${webhookId}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Remove old entries outside the sliding window
    await redisClient.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const count = await redisClient.zcard(key);

    if (count >= limit) {
      // Get the oldest request timestamp to calculate reset time
      const oldest = await redisClient.zrange(key, 0, 0, "WITHSCORES");
      const resetAt =
        oldest.length > 1
          ? Number.parseInt(oldest[1], 10) + windowSeconds * 1000
          : now + windowSeconds * 1000;

      logger.debug(
        `Rate limit exceeded for webhook ${webhookId}: ${count}/${limit}`
      );

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request to the window
    await redisClient.zadd(key, now, `${now}-${Math.random()}`);

    // Set expiry on the key
    await redisClient.expire(key, windowSeconds * 2);

    const remaining = limit - count - 1;

    logger.debug(
      `Rate limit check for webhook ${webhookId}: ${count + 1}/${limit} (${remaining} remaining)`
    );

    return {
      allowed: true,
      remaining,
      resetAt: now + windowSeconds * 1000,
    };
  } catch (error) {
    logger.error(`Error checking rate limit: ${error}`);
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      remaining: 0,
      resetAt: 0,
    };
  }
}

/**
 * Reset rate limit for a webhook (useful for testing or manual override)
 */
export async function resetRateLimit(webhookId: string): Promise<void> {
  try {
    const key = `${RATE_LIMIT_PREFIX}${webhookId}`;
    await redisClient.del(key);
    logger.info(`Rate limit reset for webhook ${webhookId}`);
  } catch (error) {
    logger.error(`Error resetting rate limit: ${error}`);
  }
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  webhookId: string,
  limit: number | null,
  windowSeconds: number = DEFAULT_WINDOW
): Promise<RateLimitResult> {
  if (!limit || limit <= 0) {
    return {
      allowed: true,
      remaining: Number.POSITIVE_INFINITY,
      resetAt: 0,
    };
  }

  try {
    const key = `${RATE_LIMIT_PREFIX}${webhookId}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Count requests in current window
    const count = await redisClient.zcount(key, windowStart, now);

    const remaining = Math.max(0, limit - count);
    const allowed = count < limit;

    return {
      allowed,
      remaining,
      resetAt: now + windowSeconds * 1000,
    };
  } catch (error) {
    logger.error(`Error getting rate limit status: ${error}`);
    return {
      allowed: true,
      remaining: 0,
      resetAt: 0,
    };
  }
}
