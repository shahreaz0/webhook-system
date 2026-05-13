import { createRouter } from "@/lib/create-app";

import * as handlers from "./event-types.handlers";
import * as routes from "./event-types.routes";

export const eventTypes = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);
