import type { Message } from "@webhook/database";
import { prisma } from "@webhook/database";
import { logger } from "@webhook/logger";
import { Worker } from "bullmq";
import pLimit from "p-limit";
import { MESSAGE_QUEUE } from "@/api/configs/bullmq";
import { redisClient } from "@/api/configs/redis";
import { getWebhooksForMessage } from "../webhooks/webhooks.services";
import { deliverMessage, updateMessageStatus } from "./messages.services";
import type { MessageJobData } from "./messages.types";

logger.info("workers", "Message worker started");

const httpLimit = pLimit(50);

const worker = new Worker<MessageJobData>(
  MESSAGE_QUEUE,
  async (job) => {
    // Update message status to processing
    await updateMessageStatus(job.data.message.id, "PROCESSING");

    if (!job.data.message.subscriberId) {
      throw new Error("Subscriber not found");
    }

    // Fetch webhooks for this message (with caching)
    const allWebhooks = await getWebhooksForMessage(
      job.data.message.subscriberId,
      job.data.message.eventTypeId
    );

    // Filter webhooks by label matching
    const eventLabels =
      (job.data.message.labels as Record<string, string>) || {};
    const webhooks = allWebhooks.filter((wh) => {
      const subLabels = (wh.labels as Record<string, string>) || {};
      if (Object.keys(subLabels).length === 0) {
        return true; // No label filters on the subscription matches all events
      }
      return Object.entries(subLabels).every(
        ([k, v]) => String(eventLabels[k]) === String(v)
      );
    });

    if (webhooks.length === 0) {
      logger.info(
        "workers",
        `No matching webhooks found for message ${job.data.message.id} after label filtering, marking as delivered`
      );
      await updateMessageStatus(job.data.message.id, "DELIVERED");
      return;
    }

    // Find deliveries that have already succeeded
    const existingDeliveries = await prisma.messageDelivery.findMany({
      where: {
        messageId: job.data.message.id,
        status: "DELIVERED",
      },
      select: { webhookId: true },
    });
    const deliveredWebhookIds = new Set(
      existingDeliveries.map((d) => d.webhookId)
    );

    // Only process webhooks that haven't been successfully delivered yet
    const pendingWebhooks = webhooks.filter(
      (wh) => !deliveredWebhookIds.has(wh.id)
    );

    if (pendingWebhooks.length === 0) {
      logger.info(
        "workers",
        `All webhooks already delivered for message ${job.data.message.id}`
      );
      await updateMessageStatus(job.data.message.id, "DELIVERED");
      return;
    }

    // Deliver to all pending webhooks with bounded concurrency
    const promises = pendingWebhooks.map((wh) =>
      httpLimit(() => deliverMessage(job.data.message, wh))
    );

    const results = await Promise.allSettled(promises);

    const errors = [] as { error: Error; message: Message }[];
    const successes = [] as unknown[];

    for (const r of results) {
      if (r.status === "fulfilled") {
        successes.push(r.value);
      } else {
        errors.push({
          error: r.reason as Error,
          message: job.data.message,
        });
      }
    }

    // Fetch all deliveries to determine the overall message status
    const allDeliveries = await prisma.messageDelivery.findMany({
      where: { messageId: job.data.message.id },
      select: { status: true },
    });

    const deliveredCount = allDeliveries.filter(
      (d) => d.status === "DELIVERED"
    ).length;

    if (deliveredCount === webhooks.length) {
      await updateMessageStatus(job.data.message.id, "DELIVERED");
    } else if (deliveredCount > 0) {
      await updateMessageStatus(job.data.message.id, "PARTIAL");
    } else {
      await updateMessageStatus(job.data.message.id, "FAILED");
    }

    logger.info(
      "workers",
      `Message ${job.data.message.id} processed: ${successes.length} succeeded, ${errors.length} failed, final delivered count: ${deliveredCount}/${webhooks.length}`
    );

    if (errors.length > 0) {
      throw new Error(
        `Failed to deliver message to ${errors.length} webhooks`,
        {
          cause: {
            errors,
            message: job.data.message,
          },
        }
      );
    }
  },
  {
    connection: redisClient,
    concurrency: 10,
    removeOnFail: { count: 100 },
    removeOnComplete: { count: 100 },
  }
);

worker.on("completed", (job) => {
  logger.info("workers", `Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  logger.error("workers", `Job ${job?.id} failed: ${err.message}`);
});

worker.on("error", (err) => {
  logger.error("workers", `Worker error: ${err.message}`);
});
