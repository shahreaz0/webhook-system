import { createRoute } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { z } from "zod";
import { createHttpErrorSchema } from "@/lib/common-schemas";
import {
  AuthUserSchema,
  LoginResponseSchema,
  LoginSchema,
  RegisterSchema,
} from "./auth.schemas";

const tags = ["Auth"];

export const register = createRoute({
  tags,
  method: "post",
  path: "/auth/register",
  summary: "Register a new user",
  description:
    "Create a new user account with email, password, and optional name. Returns the created user record.",

  request: {
    body: {
      description: "The user registration payload",
      content: {
        "application/json": {
          schema: RegisterSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Created — User registered successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: AuthUserSchema,
          }),
        },
      },
    },
    409: {
      description: "Conflict — email already exists.",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({
            statusCode: "409",
            example: "User already exists",
          }),
        },
      },
    },
    422: {
      description:
        "Unprocessable Entity — validation failed; see `errors` for details.",
      content: {
        "application/json": {
          schema: createErrorSchema(RegisterSchema),
        },
      },
    },
  },
});

export const login = createRoute({
  tags,
  method: "post",
  path: "/auth/login",
  summary: "Login a user",
  description:
    "Authenticate user using email and password. Returns user data and authentication token.",

  request: {
    body: {
      description: "Login payload",
      content: {
        "application/json": {
          schema: LoginSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "OK — login successful",
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
    },
    422: {
      description: "Unprocessable Entity — request body validation failed.",
      content: {
        "application/json": {
          schema: createErrorSchema(LoginSchema),
        },
      },
    },
    401: {
      description: "Unauthorized — credentials invalid.",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({
            statusCode: "401",
            example: "Invalid email or password",
          }),
        },
      },
    },
  },
});

export const getToken = createRoute({
  tags,
  method: "post",
  path: "/auth/token",
  summary: "Get a new jwt token",
  description: "Get a new jwt token.",

  request: {
    headers: z.object({
      token: z.string().openapi({
        description: "Session token for authentication",
      }),
    }),
  },

  responses: {
    200: {
      description: "OK — login successful",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.object({
              token: z.string().openapi({ example: "your_token_here" }),
            }),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized — credentials invalid.",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({
            statusCode: "401",
            example: "Unauthorized",
          }),
        },
      },
    },
  },
});

export const logout = createRoute({
  tags,
  method: "post",
  path: "/auth/logout",
  summary: "Logout user",
  description: "Logout user.",

  request: {
    headers: z.object({
      token: z.string().openapi({
        description: "Session token for authentication",
      }),
    }),
  },

  responses: {
    200: {
      description: "OK — logout successful",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized — credentials invalid.",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({
            statusCode: "401",
            example: "Unauthorized",
          }),
        },
      },
    },
  },
});

export type RegisterRoute = typeof register;
export type LoginRoute = typeof login;
export type GetTokenRoute = typeof getToken;
export type LogoutRoute = typeof logout;
