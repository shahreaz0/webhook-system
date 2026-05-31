import { createRoute, z } from "@hono/zod-openapi";
import { checkDbConnection } from "@webhook/database";
import { checkRedisConnection } from "@/api/configs/redis";
import { createRouter } from "@/api/lib/create-app";
import packageJSON from "../../../package.json" with { type: "json" };

export const index = createRouter()
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/",
      summary: "Health Check",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.object({
                name: z.string(),
                status: z.string(),
                version: z.string(),
                timestamp: z.number(),
              }),
            },
          },
          description: "Health Check API",
        },
      },
    }),
    (c) =>
      c.json({
        name: "webhook service",
        status: "OK",
        version: packageJSON.version,
        timestamp: Date.now(),
      })
  )
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/ready",
      summary: "Readiness Check",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.object({
                status: z.string(),
                database: z.string(),
                redis: z.string(),
              }),
            },
          },
          description: "API is ready",
        },
        503: {
          content: {
            "application/json": {
              schema: z.object({
                status: z.string(),
                database: z.string(),
                redis: z.string(),
              }),
            },
          },
          description: "API is not ready",
        },
      },
    }),
    async (c) => {
      const [isDbConnected, isRedisConnected] = await Promise.all([
        checkDbConnection(),
        checkRedisConnection(),
      ]);

      const response = {
        status: isDbConnected && isRedisConnected ? "ready" : "not ready",
        database: isDbConnected ? "connected" : "disconnected",
        redis: isRedisConnected ? "connected" : "disconnected",
      };

      if (response.status === "ready") {
        return c.json(response, 200);
      }

      return c.json(response, 503);
    }
  );
