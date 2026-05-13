import xior from "xior";
import errorRetryPlugin from "xior/plugins/error-retry";
import { logger } from "@/lib/logger";

export const http = xior.create({
  timeout: 30_000, // 30 second timeout
});

http.plugins.use(
  errorRetryPlugin({
    retryTimes: 3,
    retryInterval(count, _config, _error) {
      // Exponential backoff: 100ms, 500ms, 2000ms
      return Math.min(100 * 5 ** (count - 1), 2000);
    },
    onRetry(config, error, count) {
      logger.info(
        `xior.ts: ${config.method} ${config.url} retry ${count} times - Error: ${error.message}`
      );
    },
  })
);
