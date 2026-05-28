import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { EvlogVariables } from "@webhook/logger";
export interface AppBindings {
  Variables: {
    logger: EvlogVariables["Variables"]["log"];
    userId: string;
    jwtPayload: {
      id: string;
      name: string;
    };
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
