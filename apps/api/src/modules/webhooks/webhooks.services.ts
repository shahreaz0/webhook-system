import { prisma } from "@webhook/database";
import {
  type CachedWebhook,
  getCachedWebhooks,
  setCachedWebhooks,
} from "./webhooks.utils";

export async function getWebhooksForMessage(
  subscriberId: string,
  eventTypeId: string
): Promise<CachedWebhook[]> {
  // Try to get webhooks from cache first
  let webhooks: CachedWebhook[] | null = await getCachedWebhooks(
    subscriberId,
    eventTypeId
  );

  // If not in cache, fetch from database
  if (!webhooks) {
    const dbWebhooks = await prisma.webhook.findMany({
      where: {
        subscriberId,
        webhookEventTypes: { some: { eventTypeId } },
        disabled: false,
      },
      select: {
        id: true,
        url: true,
        secret: true,
        disabled: true,
        rateLimit: true,
      },
    });

    webhooks = dbWebhooks;

    // Cache the results
    await setCachedWebhooks(subscriberId, eventTypeId, webhooks);
  }

  return webhooks;
}
