import { env } from "@webhook/env";
import { pinoLogger } from "hono-pino";
import pino from "pino";

export const logger = pino({
  level: env.LOG_LEVEL || "info",

  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname,req,res,responseTime,reqId",
    },
  },
});

export function httpLogger() {
  return pinoLogger({ pino: logger });
}
