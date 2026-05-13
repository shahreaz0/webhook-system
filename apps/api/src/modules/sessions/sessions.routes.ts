import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { IdParamsSchema, NotFoundSchema } from "@/lib/common-schemas";
import { SessionListQuerySchema, SessionSchema } from "./sessions.schemas";

const tags = ["Sessions"];

// ----------------------------
// List Sessions
// ----------------------------
export const list = createRoute({
  tags,
  method: "get",
  path: "/sessions",
  summary: "List sessions",
  description: "Retrieve a list of sessions for the authenticated user.",
  request: {
    query: SessionListQuerySchema,
  },
  responses: {
    200: {
      description:
        "OK — the request succeeded and the response contains the requested data.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.array(SessionSchema),
          }),
        },
      },
    },
  },
});

// ----------------------------
// Get One Session
// ----------------------------
export const getOne = createRoute({
  tags,
  method: "get",
  path: "/sessions/{id}",
  summary: "Get session",
  description: "Retrieve the details of a single session identified by id.",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      description: "OK — session details returned successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: SessionSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — invalid path parameter (id).",
      content: {
        "application/json": {
          schema: createErrorSchema(IdParamsSchema),
        },
      },
    },
    404: {
      description: "Not Found — no session exists with the provided id.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

// ----------------------------
// Revoke Session
// ----------------------------
export const remove = createRoute({
  tags,
  method: "delete",
  path: "/sessions/{id}",
  summary: "Revoke session",
  description: "Revoke the session identified by id.",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      description:
        "OK — session revoked successfully. Response includes the id of the revoked session.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({ id: z.string() }),
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — invalid path parameters (id).",
      content: {
        "application/json": {
          schema: createErrorSchema(IdParamsSchema),
        },
      },
    },
    404: {
      description:
        "Not Found — no session exists with the provided id to revoke.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

// ----------------------------
// Revoke All Sessions
// ----------------------------
export const removeAll = createRoute({
  tags,
  method: "delete",
  path: "/sessions",
  summary: "Revoke all sessions",
  description:
    "Revoke all sessions for the authenticated user except the current session.",
  responses: {
    200: {
      description:
        "OK — sessions revoked successfully. Response includes the count of revoked sessions.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({ count: z.number() }),
          }),
        },
      },
    },
  },
});

// ----------------------------
// Export Route Types
// ----------------------------
export type ListRoute = typeof list;
export type GetOneRoute = typeof getOne;
export type RemoveRoute = typeof remove;
export type RemoveAllRoute = typeof removeAll;
