import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { NotFoundSchema } from "@/lib/common-schemas";
import {
  AppUserParamsSchema,
  MessageCreateSchema,
  MessageListQuerySchema,
  MessageParamsSchema,
  MessageSchema,
  MessageUpdateSchema,
} from "./messages.schemas";

const tags = ["Messages"];

export const list = createRoute({
  tags,
  method: "get",
  path: "/app-users/{appUserId}/messages",
  summary: "List app user messages",
  description: "Retrieve a list of messages for the specified app user.",
  request: {
    params: AppUserParamsSchema,
    query: MessageListQuerySchema,
  },
  responses: {
    200: {
      description: "OK — list returned successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.array(MessageSchema),
          }),
        },
      },
    },
  },
});

export const create = createRoute({
  tags,
  method: "post",
  path: "/app-users/{appUserId}/messages",
  summary: "Create app user message",
  description: "Create a new message for the specified app user.",
  request: {
    params: AppUserParamsSchema,
    body: {
      description: "The message to create",
      content: {
        "application/json": {
          schema: MessageCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created — message created successfully.",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean(), data: MessageSchema }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — request body validation failed.",
      content: {
        "application/json": {
          schema: createErrorSchema(MessageCreateSchema),
        },
      },
    },
  },
});

export const getOne = createRoute({
  tags,
  method: "get",
  path: "/app-users/{appUserId}/messages/{messageId}",
  summary: "Get app user message",
  description:
    "Retrieve the details of a single message identified by messageId for the specified app user.",
  request: { params: MessageParamsSchema },
  responses: {
    200: {
      description: "OK — message returned successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: MessageSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — invalid path parameter (messageId).",
      content: {
        "application/json": { schema: createErrorSchema(MessageParamsSchema) },
      },
    },
    404: {
      description: "Not Found — no message exists with the provided messageId.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export const patch = createRoute({
  tags,
  method: "patch",
  path: "/app-users/{appUserId}/messages/{messageId}",
  summary: "Update app user message",
  description:
    "Partially update an existing message identified by messageId for the specified app user.",
  request: {
    params: MessageParamsSchema,
    body: {
      description: "Partial fields to update",
      content: { "application/json": { schema: MessageUpdateSchema } },
    },
  },
  responses: {
    200: {
      description: "OK — message updated successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: MessageSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — validation error.",
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(MessageUpdateSchema),
            createErrorSchema(MessageParamsSchema),
          ]),
        },
      },
    },
    404: {
      description:
        "Not Found — no message exists with the provided messageId to update.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
