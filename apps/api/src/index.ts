import { checkDbConnection } from "@xwebhook/database";
import { env } from "@xwebhook/env";
import { app } from "@/api/app";

import "@/api/modules/messages/messages.workers";

checkDbConnection();

export default {
  port: env.PORT,
  fetch: app.fetch,
};
