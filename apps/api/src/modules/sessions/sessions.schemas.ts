import { z } from "zod";
import {
  createSortBySchema,
  PaginationQuerySchema,
  SortOrderSchema,
} from "@/lib/common-schemas";

export const SessionSchema = z.object({
  id: z.cuid2().openapi({ example: "ckz1234560000abcdef12345" }),
  userId: z.cuid2().openapi({ example: "ckz1234560000abcdef12345" }),
  token: z.string().openapi({ example: "..." }),
  expiresAt: z.date().openapi({
    example: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  ipAddress: z.string().nullable().openapi({ example: "192.168.1.1" }),
  userAgent: z.string().nullable().openapi({ example: "Mozilla/5.0..." }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
  deletedAt: z.date().nullish().openapi({ example: new Date().toISOString() }),
});

export const SessionListQuerySchema = PaginationQuerySchema.extend({
  // Sorting
  sortBy: createSortBySchema(["createdAt", "expiresAt"], "createdAt"),
  order: SortOrderSchema,
});
