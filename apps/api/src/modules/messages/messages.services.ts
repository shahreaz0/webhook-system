import type { MessageStatus } from "@xwebhook/database";
import { prisma } from "@xwebhook/database";
import { logger } from "@xwebhook/logger";
import { checkRateLimit } from "@/api/lib/rate-limiter";
import { http } from "@/api/lib/xior";
import type { CachedWebhook } from "../webhooks/webhooks.utils";
import type { MessageJobData } from "./messages.types";

export function updateMessageStatus(messageId: string, status: MessageStatus) {
  return prisma.message.update({
    where: { id: messageId },
    data: { status, deliverAt: status === "DELIVERED" ? new Date() : null },
  });
}

export async function deliverMessage(
  message: MessageJobData["message"],
  wh: CachedWebhook
) {
  const startTime = Date.now();

  try {
    // Check rate limit
    const rateLimit = await checkRateLimit(wh.id, wh.rateLimit);

    if (!rateLimit.allowed) {
      logger.warn(
        "messages",
        `Rate limit exceeded for webhook ${wh.id}, retry after ${new Date(rateLimit.resetAt).toISOString()}`
      );

      await prisma.messageDelivery.upsert({
        where: {
          messageId_webhookId: {
            messageId: message.id,
            webhookId: wh.id,
          },
        },
        update: {
          status: "SKIPPED",
          attempts: { increment: 1 },
          lastError: `Rate limit exceeded, retry after ${new Date(rateLimit.resetAt).toISOString()}`,
          nextRetryAt: new Date(rateLimit.resetAt),
        },
        create: {
          messageId: message.id,
          webhookId: wh.id,
          status: "SKIPPED",
          attempts: 1,
          lastError: `Rate limit exceeded, retry after ${new Date(rateLimit.resetAt).toISOString()}`,
          nextRetryAt: new Date(rateLimit.resetAt),
        },
      });

      throw new Error("Rate limit exceeded");
    }

    // Deliver the message
    const response = await http.request({
      method: (wh.method ? wh.method.toLowerCase() : "post") as any,
      url: wh.url,
      data: {
        event: message.eventName,
        data: message.payload,
      },
      headers: {
        ...((wh.headers as Record<string, string>) || {}),
        "x-webhook-secret": wh.secret,
      },
    });

    console.log({ data: response.data, status: response.status });

    const duration = Date.now() - startTime;

    // Record success
    // await recordSuccess(wh.id);

    await prisma.messageDelivery.upsert({
      where: {
        messageId_webhookId: {
          messageId: message.id,
          webhookId: wh.id,
        },
      },
      update: {
        status: "DELIVERED",
        attempts: { increment: 1 },
        deliveredAt: new Date(),
        lastError: null,
        nextRetryAt: null,
      },
      create: {
        messageId: message.id,
        webhookId: wh.id,
        status: "DELIVERED",
        attempts: 1,
        deliveredAt: new Date(),
      },
    });

    logger.info(
      "messages",
      `Webhook delivered successfully to ${wh.url} in ${duration}ms`
    );

    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Record failure for circuit breaker
    // await recordFailure(wh.id);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error(
      "messages",
      `Failed to deliver webhook to ${wh.url} after ${duration}ms: ${errorMessage}`
    );

    // Only create delivery record if not already created (rate limit/circuit breaker)
    const isCircuitBreakerError = errorMessage.includes("Circuit breaker");
    const isRateLimitError = errorMessage.includes("Rate limit");

    if (!(isCircuitBreakerError || isRateLimitError)) {
      await prisma.messageDelivery.upsert({
        where: {
          messageId_webhookId: {
            messageId: message.id,
            webhookId: wh.id,
          },
        },
        update: {
          status: "FAILED",
          attempts: { increment: 1 },
          lastError: errorMessage.slice(0, 500),
          nextRetryAt: null,
        },
        create: {
          messageId: message.id,
          webhookId: wh.id,
          status: "FAILED",
          attempts: 1,
          lastError: errorMessage.slice(0, 500),
        },
      });
    }

    throw new Error("Failed to deliver message", {
      cause: {
        error,
        message,
      },
    });
  }
}
