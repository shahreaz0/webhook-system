import { z } from "zod";
import {
  createSortBySchema,
  PaginationQuerySchema,
  SortOrderSchema,
} from "@/lib/common-schemas";
import { UserSchema } from "../users/users.schemas";

export const ApplicationSchema = z.object({
  id: z.cuid2().openapi({ example: "ckz1234560000abcdef12345" }),
  name: z.string().openapi({ example: "My App" }),
  description: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: "This is a sample application" }),
  userId: z.cuid2().openapi({ example: "ckz1234560000abcdef67890" }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
  deletedAt: z.date().nullish().openapi({ example: new Date().toISOString() }),
});

export const ApplicationSchemaWithUser = ApplicationSchema.extend({
  user: UserSchema,
});

export const ApplicationCreateSchema = ApplicationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  userId: true,
});

export const ApplicationUpdateSchema = ApplicationCreateSchema.partial();

export const ApplicationListQuerySchema = PaginationQuerySchema.extend({
  // Sorting
  sortBy: createSortBySchema(["name", "createdAt", "updatedAt"], "createdAt"),
  order: SortOrderSchema,
  // Filtering
  search: z
    .string()
    .optional()
    .openapi({
      param: { name: "search", in: "query" },
      example: "my app",
      description: "Search applications by name (case-insensitive)",
    }),
});
