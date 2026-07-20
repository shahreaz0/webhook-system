import { env } from "@xwebhook/env";
import { initLogger } from "evlog";

initLogger({
  env: {
    service: "webhook-system",
    environment: env.NODE_ENV,
  },
});

// biome-ignore lint/performance/noBarrelFile: <none>
export { createLogger, log as logger } from "evlog";
export { type EvlogVariables, evlog } from "evlog/hono";
