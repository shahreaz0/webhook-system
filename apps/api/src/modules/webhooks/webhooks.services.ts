import { prisma } from "@webhook/database";
import {
  type CachedWebhook,
  getCachedWebhooks,
  setCachedWebhooks,
} from "./webhooks.utils";

export async function getWebhooksForMessage(
  appUserId: string,
  eventTypeId: string
) {
  // Try to get webhooks from cache first
  let webhooks: CachedWebhook[] | null = await getCachedWebhooks(
    appUserId,
    eventTypeId
  );

  // If not in cache, fetch from database
  if (!webhooks) {
    const dbWebhooks = await prisma.webhook.findMany({
      where: {
        appUserId,
        eventTypes: { some: { eventTypeId } },
        disabled: false,
      },
      select: {
        id: true,
        url: true,
        secrets: true,
        disabled: true,
        rateLimit: true,
      },
    });

    webhooks = dbWebhooks;

    // Cache the results
    await setCachedWebhooks(appUserId, eventTypeId, webhooks);
  }

  return webhooks;
}
