import { checkDbConnection } from "@webhook/database";
import { env } from "@webhook/env";
import { app } from "@/app";

import "@/modules/messages/messages.workers";

checkDbConnection();

export default {
  port: env.PORT,
  fetch: app.fetch,
};
