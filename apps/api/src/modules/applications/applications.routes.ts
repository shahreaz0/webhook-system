import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { IdParamsSchema, NotFoundSchema } from "@/lib/common-schemas";
import {
  ApplicationCreateSchema,
  ApplicationListQuerySchema,
  ApplicationSchema,
  ApplicationSchemaWithUser,
  ApplicationUpdateSchema,
} from "./applications.schemas";

const tags = ["Applications"];

// ----------------------------
// List Applications
// ----------------------------
export const list = createRoute({
  tags,
  method: "get",
  path: "/applications",
  summary: "List applications",
  description: "Retrieve a list of applications for the authenticated user.",
  request: {
    query: ApplicationListQuerySchema,
  },
  responses: {
    200: {
      description:
        "OK — the request succeeded and the response contains the requested data.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.array(ApplicationSchema),
          }),
        },
      },
    },
  },
});

// ----------------------------
// Create Application
// ----------------------------
export const create = createRoute({
  tags,
  method: "post",
  path: "/applications",
  summary: "Create application",
  description: "Create a new application for the authenticated user.",
  request: {
    body: {
      description: "The application to create",
      content: {
        "application/json": {
          schema: ApplicationCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description:
        "Created — application successfully created and returned in the response.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: ApplicationSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — request body validation failed.",
      content: {
        "application/json": {
          schema: createErrorSchema(ApplicationCreateSchema),
        },
      },
    },
  },
});

// ----------------------------
// Get One Application
// ----------------------------
export const getOne = createRoute({
  tags,
  method: "get",
  path: "/applications/{id}",
  summary: "Get application",
  description: "Retrieve the details of a single application identified by id.",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      description: "OK — application details returned successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: ApplicationSchemaWithUser,
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
      description: "Not Found — no application exists with the provided id.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

// ----------------------------
// Update Application
// ----------------------------
export const patch = createRoute({
  tags,
  method: "patch",
  path: "/applications/{id}",
  summary: "Update application",
  description: "Partially update an existing application identified by id.",
  request: {
    params: IdParamsSchema,
    body: {
      description:
        "Partial application fields to update (only provided fields will be applied).",
      content: {
        "application/json": {
          schema: ApplicationUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK — application updated successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: ApplicationSchema,
          }),
        },
      },
    },
    422: {
      description:
        "Unprocessable Entity — validation error for body or path parameters.",
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(ApplicationUpdateSchema),
            createErrorSchema(IdParamsSchema),
          ]),
        },
      },
    },
    404: {
      description:
        "Not Found — no application exists with the provided id to update.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

// ----------------------------
// Delete Application
// ----------------------------
export const remove = createRoute({
  tags,
  method: "delete",
  path: "/applications/{id}",
  summary: "Delete application",
  description: "Delete the application identified by id.",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      description:
        "OK — application deleted successfully. Response includes the id of the removed application.",
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
        "Not Found — no application exists with the provided id to delete.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

// ----------------------------
// Export Route Types
// ----------------------------
export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
