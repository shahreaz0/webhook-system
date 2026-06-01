import { createRouter } from "@/api/lib/create-app";
import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

export const users = createRouter()
  .openapi(routes.getMe, handlers.getMe)
  .openapi(routes.updateMe, handlers.updateMe)
  .openapi(routes.removeMe, handlers.removeMe);
