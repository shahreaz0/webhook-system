import type { MessageStatus } from "@webhook/database";
import { prisma } from "@webhook/database";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limiter";
import { http } from "@/lib/xior";
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
    // Check circuit breaker
    // const allowed = await shouldAllowRequest(wh.id);

    // if (!allowed) {
    //   logger.warn(
    //     `Circuit breaker OPEN for webhook ${wh.id}, skipping delivery`
    //   );

    //   await prisma.messageDelivery.create({
    //     data: {
    //       messageId: message.id,
    //       webhookId: wh.id,
    //       status: "SKIPPED",
    //       lastError: "Circuit breaker open - too many failures",
    //     },
    //   });

    //   throw new Error("Circuit breaker open");
    // }

    // Check rate limit
    const rateLimit = await checkRateLimit(wh.id, wh.rateLimit);

    if (!rateLimit.allowed) {
      logger.warn(
        `Rate limit exceeded for webhook ${wh.id}, retry after ${new Date(rateLimit.resetAt).toISOString()}`
      );

      await prisma.messageDelivery.create({
        data: {
          messageId: message.id,
          webhookId: wh.id,
          status: "SKIPPED",
          lastError: `Rate limit exceeded, retry after ${new Date(rateLimit.resetAt).toISOString()}`,
          nextRetryAt: new Date(rateLimit.resetAt),
        },
      });

      throw new Error("Rate limit exceeded");
    }

    // Deliver the message
    const response = await http.request({
      method: "post",
      url: wh.url,
      data: {
        event: message.eventName,
        data: message.payload,
      },
      headers: {
        "x-webhook-secret": wh.secrets,
      },
    });

    console.log({ data: response.data, status: response.status });

    const duration = Date.now() - startTime;

    // Record success
    // await recordSuccess(wh.id);

    await prisma.messageDelivery.create({
      data: {
        messageId: message.id,
        webhookId: wh.id,
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    logger.info(
      `messages.services.ts: Webhook delivered successfully to ${wh.url} in ${duration}ms`
    );

    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Record failure for circuit breaker
    // await recordFailure(wh.id);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error(
      `Failed to deliver webhook to ${wh.url} after ${duration}ms: ${errorMessage}`
    );

    // Only create delivery record if not already created (rate limit/circuit breaker)
    const isCircuitBreakerError = errorMessage.includes("Circuit breaker");
    const isRateLimitError = errorMessage.includes("Rate limit");

    if (!(isCircuitBreakerError || isRateLimitError)) {
      await prisma.messageDelivery.create({
        data: {
          messageId: message.id,
          webhookId: wh.id,
          status: "FAILED",
          lastError: errorMessage.slice(0, 500), // Limit error message length
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
