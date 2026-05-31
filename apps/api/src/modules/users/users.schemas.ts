import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().openapi({ example: "ckz1234560000abcdef12345" }),
  email: z.email().openapi({ example: "user@example.com" }),
  name: z.string().nullish().openapi({ example: "John Doe" }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
  deletedAt: z.date().nullish().openapi({ example: new Date().toISOString() }),
});

export const UserUpdateSchema = z.object({
  name: z.string().optional().openapi({ example: "Jane Doe" }),
});
