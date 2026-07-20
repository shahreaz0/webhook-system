import type { Prisma, Webhook } from "@xwebhook/database";
import { logger } from "@xwebhook/logger";
import { redisClient } from "@/api/configs/redis";

const CACHE_PREFIX = "webhook_cache:";
const CACHE_TTL = 300; // 5 minutes

export type CachedWebhook = Pick<
  Webhook,
  | "id"
  | "url"
  | "secret"
  | "disabled"
  | "rateLimit"
  | "name"
  | "method"
  | "headers"
  | "labels"
>;

export function buildWebhookFilters(
  subscriberId: string,
  query: {
    disabled?: boolean;
    eventTypeId?: string;
    archived?: boolean;
  }
) {
  const where: Prisma.WebhookWhereInput = {
    subscriberId,
  };

  // Filter by disabled status
  if (query.disabled !== undefined) {
    where.disabled = query.disabled;
  }

  // Filter by archived status
  if (query.archived !== undefined) {
    where.archived = query.archived;
  }

  // Filter by eventTypeId (webhooks subscribed to this event type)
  if (query.eventTypeId) {
    where.webhookEventTypes = { some: { eventTypeId: query.eventTypeId } };
  }

  return where;
}

/**
 * Get webhooks from cache or database
 * Cache key format: webhook_cache:{subscriberId}:{eventTypeId}
 */
export async function getCachedWebhooks(
  subscriberId: string,
  eventTypeId: string
): Promise<CachedWebhook[] | null> {
  try {
    const cacheKey = `${CACHE_PREFIX}${subscriberId}:${eventTypeId}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      logger.debug("webhooks", `Cache hit for webhooks: ${cacheKey}`);
      return JSON.parse(cached) as Webhook[];
    }

    logger.debug("webhooks", `Cache miss for webhooks: ${cacheKey}`);
    return null;
  } catch (error) {
    logger.error("webhooks", `Error getting cached webhooks: ${error}`);
    return null;
  }
}

/**
 * Set webhooks in cache
 */
export async function setCachedWebhooks(
  subscriberId: string,
  eventTypeId: string,
  webhooks: CachedWebhook[]
): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${subscriberId}:${eventTypeId}`;
    await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(webhooks));
    logger.debug("webhooks", `Cached webhooks: ${cacheKey}`);
  } catch (error) {
    logger.error("webhooks", `Error setting cached webhooks: ${error}`);
  }
}

/**
 * Invalidate webhook cache for a specific app user
 */
export async function invalidateWebhookCache(
  subscriberId: string
): Promise<void> {
  try {
    const pattern = `${CACHE_PREFIX}${subscriberId}:*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.debug(
        "webhooks",
        `Invalidated ${keys.length} webhook cache entries`
      );
    }
  } catch (error) {
    logger.error("webhooks", `Error invalidating webhook cache: ${error}`);
  }
}
