// import { checkDbConnection } from "@webhook/database";
import { app } from "@/app";
import { env } from "@/lib/env";

import "@/modules/messages/messages.workers";

// checkDbConnection();

export default {
  port: env.PORT,
  fetch: app.fetch,
};
