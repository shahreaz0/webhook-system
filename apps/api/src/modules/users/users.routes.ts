import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { NotFoundSchema } from "@/lib/common-schemas";
import { UserSchema, UserUpdateSchema } from "./users.schemas";

const tags = ["Users"];

// ----------------------------
// Get Current User
// ----------------------------
export const getMe = createRoute({
  tags,
  method: "get",
  path: "/users/me",
  summary: "Retrieve current user profile",
  description: "Retrieve the details of the currently authenticated user.",
  responses: {
    200: {
      description: "OK — user details returned successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: UserSchema,
          }),
        },
      },
    },
    404: {
      description: "Not Found — user not found.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

// ----------------------------
// Update Current User
// ----------------------------
export const updateMe = createRoute({
  tags,
  method: "patch",
  path: "/users/me",
  summary: "Update current user profile",
  description: "Update the details of the currently authenticated user.",
  request: {
    body: {
      description: "User update payload",
      content: {
        "application/json": {
          schema: UserUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK — user updated successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: UserSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — validation failed.",
      content: {
        "application/json": {
          schema: createErrorSchema(UserUpdateSchema),
        },
      },
    },
    404: {
      description: "Not Found — user not found.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

// ----------------------------
// Delete Current User
// ----------------------------
export const removeMe = createRoute({
  tags,
  method: "delete",
  path: "/users/me",
  summary: "Delete current user account",
  description: "Permanently delete the currently authenticated user account.",
  responses: {
    200: {
      description: "OK — user deleted successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.object({ id: z.string() }),
          }),
        },
      },
    },
    404: {
      description: "Not Found — user not found.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

export type GetMeRoute = typeof getMe;
export type UpdateMeRoute = typeof updateMe;
export type RemoveMeRoute = typeof removeMe;
