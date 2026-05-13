import { createRoute } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { NotFoundSchema } from "@/lib/common-schemas";
import {
  ApplicationIdParamsSchema,
  AppUserCreateSchema,
  AppUserListQuerySchema,
  AppUserParamsSchema,
  AppUserSchema,
  AppUserSchemaDetails,
  AppUserUpdateSchema,
} from "./app-users.schemas";

const tags = ["AppUsers"];

import { z } from "zod";

export const list = createRoute({
  tags,
  method: "get",
  path: "/applications/{applicationId}/app-users",
  summary: "List application users",
  description:
    "Retrieve a list of application users for the specified application.",
  request: {
    params: ApplicationIdParamsSchema,
    query: AppUserListQuerySchema,
  },
  responses: {
    200: {
      description: "OK — list returned successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.array(AppUserSchema),
          }),
        },
      },
    },
  },
});

export const create = createRoute({
  tags,
  method: "post",
  path: "/applications/{applicationId}/app-users",
  summary: "Create application user",
  description: "Create a new AppUser for the specified application.",
  request: {
    params: ApplicationIdParamsSchema,
    body: {
      description: "The app user to create",
      content: {
        "application/json": {
          schema: AppUserCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created — app user created successfully.",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean(), data: AppUserSchema }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — request body validation failed.",
      content: {
        "application/json": {
          schema: createErrorSchema(AppUserCreateSchema),
        },
      },
    },
  },
});

export const getOne = createRoute({
  tags,
  method: "get",
  path: "/applications/{applicationId}/app-users/{appUserId}",
  summary: "Get application user",
  description:
    "Retrieve the details of a single AppUser identified by appUserId for the specified application.",
  request: { params: AppUserParamsSchema },
  responses: {
    200: {
      description: "OK — app user returned successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: AppUserSchemaDetails,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — invalid path parameter (appUserId).",
      content: {
        "application/json": { schema: createErrorSchema(AppUserParamsSchema) },
      },
    },
    404: {
      description:
        "Not Found — no app user exists with the provided appUserId.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export const patch = createRoute({
  tags,
  method: "patch",
  path: "/applications/{applicationId}/app-users/{appUserId}",
  summary: "Update application user",
  description:
    "Partially update an existing AppUser identified by appUserId for the specified application.",
  request: {
    params: AppUserParamsSchema,
    body: {
      description: "Partial fields to update",
      content: { "application/json": { schema: AppUserUpdateSchema } },
    },
  },
  responses: {
    200: {
      description: "OK — app user updated successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: AppUserSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — validation error.",
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(AppUserUpdateSchema),
            createErrorSchema(AppUserParamsSchema),
          ]),
        },
      },
    },
    404: {
      description:
        "Not Found — no app user exists with the provided appUserId to update.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export const remove = createRoute({
  tags,
  method: "delete",
  path: "/applications/{applicationId}/app-users/{appUserId}",
  summary: "Delete application user",
  description:
    "Delete the AppUser identified by appUserId for the specified application.",
  request: { params: AppUserParamsSchema },
  responses: {
    200: {
      description: "OK — app user deleted successfully.",
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
      description:
        "Unprocessable Entity — invalid path parameters (appUserId).",
      content: {
        "application/json": { schema: createErrorSchema(AppUserParamsSchema) },
      },
    },
    404: {
      description:
        "Not Found — no app user exists with the provided appUserId to delete.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
