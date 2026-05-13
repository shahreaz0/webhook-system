import { Queue } from "bullmq";
import { redisClient } from "@/configs/redis";
import { logger } from "@/lib/logger";

export const MESSAGE_QUEUE = "messages";

export const messagesQueue = new Queue(MESSAGE_QUEUE, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 60 * 60,
    },
    removeOnFail: {
      count: 500,
      age: 24 * 60 * 60,
    },
  },
});

// Queue event handlers

messagesQueue.on("waiting", (job) => {
  logger.debug(`bullmq.ts: Job ${job.id} is waiting`);
});
