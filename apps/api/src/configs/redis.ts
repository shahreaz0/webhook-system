import { env } from "@webhook/env";
import { logger } from "@webhook/logger";
import IORedis from "ioredis";

export const redisClient = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

// Connection event handlers
redisClient.on("connect", () => {
  logger.info("redis", "Redis connected!");
});

redisClient.on("error", (err) => {
  logger.error("redis", `Redis client error: ${err.message}`);
});

redisClient.on("close", () => {
  logger.warn("redis", "Redis client connection closed");
});

redisClient.on("reconnecting", () => {
  logger.info("redis", "Redis client reconnecting");
});

export async function checkRedisConnection() {
  try {
    const pong = await redisClient.ping();
    logger.info("redis", `Redis connected!: ${pong}`);
    return true;
  } catch (error) {
    logger.error("redis", `Redis connection failed: ${error}`);
    return false;
  }
}
