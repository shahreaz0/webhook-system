import { z } from "zod";
import {
  createSortBySchema,
  PaginationQuerySchema,
  SortOrderSchema,
} from "@/lib/common-schemas";

export const WebhookSchema = z.object({
  id: z.cuid2().openapi({ example: "ckwxyz123456abcdef12345" }),
  eventTypes: z.array(z.cuid2()).openapi({
    example: ["ckwxyz123456abcdef12345", "ckwxyz123456abcdef12345"],
  }),
  url: z.url().openapi({ example: "https://example.com/webhook" }),
  secrets: z.string().openapi({ example: "supersecret" }),
  description: z
    .string()
    .nullish()
    .openapi({ example: "Webhook for notifications" }),
  disabled: z.boolean().default(false).openapi({ example: false }),
  archived: z.boolean().default(false).openapi({ example: false }),
  metadata: z.any().nullish().openapi({ example: {} }),
  rateLimit: z.number().nullish().openapi({ example: 10 }),
  appUserId: z.cuid2().openapi({ example: "ckwxyz123456abcdef12345" }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const WebhookCreateSchema = WebhookSchema.omit({
  id: true,
  appUserId: true,
  createdAt: true,
  updatedAt: true,
});

export const WebhookUpdateSchema = WebhookCreateSchema.partial();

export const AppUserParamsSchema = z.object({
  appUserId: z
    .string()
    .openapi({ param: { name: "appUserId", in: "path", required: true } }),
});

export const WebhookParamsSchema = AppUserParamsSchema.extend({
  webhookId: z
    .string()
    .openapi({ param: { name: "webhookId", in: "path", required: true } }),
});

export const WebhookListQuerySchema = PaginationQuerySchema.extend({
  // Sorting
  sortBy: createSortBySchema(["createdAt", "url", "updatedAt"], "createdAt"),
  order: SortOrderSchema,
  // Filtering
  disabled: z.coerce.boolean().optional().openapi({
    example: false,
    description: "Filter by disabled status",
  }),
  eventTypeId: z.cuid2().optional().openapi({
    example: "cm3...",
    description: "Filter webhooks subscribed to this event type",
  }),
});
