import { z } from "zod";
import {
  createSortBySchema,
  PaginationQuerySchema,
  SortOrderSchema,
} from "@/lib/common-schemas";
import { ApplicationSchema } from "../applications/applications.schemas";

export const AppUserSchema = z.object({
  id: z.cuid2().openapi({ example: "ckz1234560000abcdef12345" }),
  applicationId: z.cuid2().openapi({ example: "ckz1234560000abcdef67890" }),
  userId: z.string().openapi({ example: "ckz1234560000abcdef99999" }),
  email: z.email().openapi({ example: "user@example.com" }),
  metadata: z.any().nullable().optional().openapi({ example: null }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
  deletedAt: z.date().nullish().openapi({ example: new Date().toISOString() }),
});

export const AppUserSchemaDetails = AppUserSchema.extend({
  application: ApplicationSchema,
});

export const AppUserCreateSchema = AppUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  applicationId: true,
});

export const AppUserUpdateSchema = AppUserCreateSchema.partial();

export const ApplicationIdParamsSchema = z.object({
  applicationId: z.cuid2(),
});

export const AppUserParamsSchema = ApplicationIdParamsSchema.extend({
  appUserId: z.cuid2(),
});

export const AppUserListQuerySchema = PaginationQuerySchema.extend({
  // Sorting
  sortBy: createSortBySchema(["email", "createdAt", "updatedAt"], "createdAt"),
  order: SortOrderSchema,
  // Filtering
  search: z
    .string()
    .optional()
    .openapi({
      param: { name: "search", in: "query" },
      example: "user@example.com",
      description: "Search by email or userId (case-insensitive)",
    }),
});
