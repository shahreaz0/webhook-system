import { createRoute } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { z } from "zod";
import { createSuccessSchema, NotFoundSchema } from "@/api/lib/common-schemas";
import {
  ApplicationIdParamsSchema,
  SubscriberCreateSchema,
  SubscriberListQuerySchema,
  SubscriberParamsSchema,
  SubscriberSchema,
  SubscriberSchemaDetails,
  SubscriberUpdateSchema,
} from "./subscribers.schemas";

const tags = ["Subscribers"];

export const list = createRoute({
  tags,
  method: "get",
  path: "/applications/{applicationId}/subscribers",
  summary: "List application users",
  description:
    "Retrieve a list of application users for the specified application.",
  request: {
    params: ApplicationIdParamsSchema,
    query: SubscriberListQuerySchema,
  },
  responses: {
    200: {
      description: "OK — list returned successfully.",
      content: {
        "application/json": {
          schema: createSuccessSchema(z.array(SubscriberSchema)),
        },
      },
    },
  },
});

export const create = createRoute({
  tags,
  method: "post",
  path: "/applications/{applicationId}/subscribers",
  summary: "Create application user",
  description: "Create a new Subscriber for the specified application.",
  request: {
    params: ApplicationIdParamsSchema,
    body: {
      description: "The app user to create",
      content: {
        "application/json": {
          schema: SubscriberCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created — app user created successfully.",
      content: {
        "application/json": {
          schema: createSuccessSchema(SubscriberSchema),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — request body validation failed.",
      content: {
        "application/json": {
          schema: createErrorSchema(SubscriberCreateSchema),
        },
      },
    },
  },
});

export const getOne = createRoute({
  tags,
  method: "get",
  path: "/applications/{applicationId}/subscribers/{subscriberId}",
  summary: "Get application user",
  description:
    "Retrieve the details of a single Subscriber identified by subscriberId for the specified application.",
  request: { params: SubscriberParamsSchema },
  responses: {
    200: {
      description: "OK — app user returned successfully.",
      content: {
        "application/json": {
          schema: createSuccessSchema(SubscriberSchemaDetails),
        },
      },
    },
    422: {
      description:
        "Unprocessable Entity — invalid path parameter (subscriberId).",
      content: {
        "application/json": {
          schema: createErrorSchema(SubscriberParamsSchema),
        },
      },
    },
    404: {
      description:
        "Not Found — no app user exists with the provided subscriberId.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export const patch = createRoute({
  tags,
  method: "patch",
  path: "/applications/{applicationId}/subscribers/{subscriberId}",
  summary: "Update application user",
  description:
    "Partially update an existing Subscriber identified by subscriberId for the specified application.",
  request: {
    params: SubscriberParamsSchema,
    body: {
      description: "Partial fields to update",
      content: { "application/json": { schema: SubscriberUpdateSchema } },
    },
  },
  responses: {
    200: {
      description: "OK — app user updated successfully.",
      content: {
        "application/json": {
          schema: createSuccessSchema(SubscriberSchema),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — validation error.",
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(SubscriberUpdateSchema),
            createErrorSchema(SubscriberParamsSchema),
          ]),
        },
      },
    },
    404: {
      description:
        "Not Found — no app user exists with the provided subscriberId to update.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export const remove = createRoute({
  tags,
  method: "delete",
  path: "/applications/{applicationId}/subscribers/{subscriberId}",
  summary: "Delete application user",
  description:
    "Delete the Subscriber identified by subscriberId for the specified application.",
  request: { params: SubscriberParamsSchema },
  responses: {
    200: {
      description: "OK — app user deleted successfully.",
      content: {
        "application/json": {
          schema: createSuccessSchema(z.object({ id: z.string() })),
        },
      },
    },
    422: {
      description:
        "Unprocessable Entity — invalid path parameters (subscriberId).",
      content: {
        "application/json": {
          schema: createErrorSchema(SubscriberParamsSchema),
        },
      },
    },
    404: {
      description:
        "Not Found — no app user exists with the provided subscriberId to delete.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
