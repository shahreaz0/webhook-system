import IORedis from "ioredis";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

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
  logger.info("Redis connected!");
});

redisClient.on("error", (err) => {
  logger.error(`Redis client error: ${err.message}`);
});

redisClient.on("close", () => {
  logger.warn("Redis client connection closed");
});

redisClient.on("reconnecting", () => {
  logger.info("Redis client reconnecting");
});

export async function checkRedisConnection() {
  try {
    const pong = await redisClient.ping();
    logger.info(`Redis connected!: ${pong}`);
    return true;
  } catch (error) {
    logger.error(`Redis connection failed: ${error}`);
    return false;
  }
}
