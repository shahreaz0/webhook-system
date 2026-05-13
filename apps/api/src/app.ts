import { configureOpenAPI } from "@/lib/configure-openapi";
import { createApp } from "@/lib/create-app";
import { appUsers } from "./modules/app-users/app-users.index";
import { applications } from "./modules/applications/applications.index";
import { auth } from "./modules/auth/auth.index";
import { eventTypes } from "./modules/event-types/event-types.index";
import { index } from "./modules/index/index.routes";
import { messages } from "./modules/messages/messages.index";
import { sessions } from "./modules/sessions/sessions.index";
import { users } from "./modules/users/users.index";
import { webhooks } from "./modules/webhooks/webhooks.index";

const routes = [
  index,
  auth,
  users,
  sessions,
  applications,
  appUsers,
  eventTypes,
  webhooks,
  messages,
];

export const app = createApp();

configureOpenAPI(app);

for (const route of routes) {
  app.route("/", route);
}
