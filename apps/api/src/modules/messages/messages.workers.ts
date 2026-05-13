import type { Message } from "@webhook/database";
import { Worker } from "bullmq";
import pLimit from "p-limit";
import { MESSAGE_QUEUE } from "@/configs/bullmq";
import { redisClient } from "@/configs/redis";
import { logger } from "@/lib/logger";
import { getWebhooksForMessage } from "../webhooks/webhooks.services";
import { deliverMessage, updateMessageStatus } from "./messages.services";
import type { MessageJobData } from "./messages.types";

logger.info("Message worker started");

const httpLimit = pLimit(50);

const worker = new Worker<MessageJobData>(
  MESSAGE_QUEUE,
  async (job) => {
    // Update message status to processing
    await updateMessageStatus(job.data.message.id, "PROCESSING");

    if (!job.data.message.appUserId) {
      throw new Error("AppUser not found");
    }

    // Fetch webhooks for this message (with caching)
    const webhooks = await getWebhooksForMessage(
      job.data.message.appUserId,
      job.data.message.eventTypeId
    );

    if (webhooks.length === 0) {
      logger.info(
        `No webhooks found for message ${job.data.message.id}, marking as delivered`
      );
      await updateMessageStatus(job.data.message.id, "DELIVERED");
      return;
    }

    // Deliver to all webhooks with bounded concurrency
    const promises = webhooks.map((wh) =>
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
          error: r.reason,
          message: job.data.message,
        });
      }
    }

    // Update message status based on results
    if (successes.length > 0 && errors.length === 0) {
      await updateMessageStatus(job.data.message.id, "DELIVERED");
    } else if (successes.length > 0 && errors.length > 0) {
      await updateMessageStatus(job.data.message.id, "PARTIAL");
    } else if (errors.length === webhooks.length) {
      await updateMessageStatus(job.data.message.id, "FAILED");

      throw new Error("Failed to deliver message to all webhooks", {
        cause: {
          errors,
          message: job.data.message,
        },
      });
    }

    logger.info(
      `Message ${job.data.message.id} processed: ${successes.length} succeeded, ${errors.length} failed`
    );
  },
  {
    connection: redisClient,
    concurrency: 10,
    removeOnFail: { count: 100 },
    removeOnComplete: { count: 100 },
  }
);

worker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed: ${err.message}`);
});

worker.on("error", (err) => {
  logger.error(`Worker error: ${err.message}`);
});
