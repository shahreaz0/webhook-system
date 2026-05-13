import { createRouter } from "@/lib/create-app";
import * as handlers from "./messages.handlers";
import * as routes from "./messages.routes";

export const messages = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch);
