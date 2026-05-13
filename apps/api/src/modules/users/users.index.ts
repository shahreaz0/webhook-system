import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "@/lib/types";
import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

export const users = new OpenAPIHono<AppBindings>();

users.openapi(routes.getMe, handlers.getMe);
users.openapi(routes.updateMe, handlers.updateMe);
users.openapi(routes.removeMe, handlers.removeMe);
