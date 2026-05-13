import { z } from "zod";
import { SessionSchema } from "../sessions/sessions.schemas";
import { UserSchema } from "../users/users.schemas";

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.email().openapi({ example: "a@b.com" }),
  password: z.string().openapi({ example: "112233" }),
});

export const LoginResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Login Successful" }),
  session: SessionSchema.omit({
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    userId: true,
  }),
  user: UserSchema.omit({ updatedAt: true, deletedAt: true }),
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().nullable(),
  createdAt: z.string(),
});
