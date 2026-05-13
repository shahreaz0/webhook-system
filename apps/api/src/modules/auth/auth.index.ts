import { createRouter } from "@/lib/create-app";

import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

export const auth = createRouter()
  .openapi(routes.register, handlers.register)
  .openapi(routes.login, handlers.login)
  .openapi(routes.getToken, handlers.getToken)
  .openapi(routes.logout, handlers.logout);
