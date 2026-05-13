import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "@/lib/types";
import * as handlers from "./sessions.handlers";
import * as routes from "./sessions.routes";

export const sessions = new OpenAPIHono<AppBindings>();

sessions.openapi(routes.list, handlers.list);
sessions.openapi(routes.getOne, handlers.getOne);
sessions.openapi(routes.remove, handlers.remove);
sessions.openapi(routes.removeAll, handlers.removeAll);
