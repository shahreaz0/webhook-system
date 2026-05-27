import { z } from "@hono/zod-openapi";
import { MessageStatus } from "@webhook/database";
import {
  createSortBySchema,
  PaginationQuerySchema,
  SortOrderSchema,
} from "@/lib/common-schemas";

export const MessageStatusSchema = z.enum(MessageStatus);

export const MessageSchema = z.object({
  id: z.cuid2().openapi({ example: "cm3..." }),
  subscriberId: z.cuid2().nullable().openapi({ example: "cm3..." }),
  eventTypeId: z.cuid2().openapi({ example: "cm3..." }),
  payload: z
    .record(z.string(), z.unknown())
    .openapi({ example: { foo: "bar" } }),
  status: MessageStatusSchema.openapi({ example: MessageStatus.PENDING }),
  deliverAt: z.string().nullable().openapi({ example: "2024-01-01T00:00:00Z" }),
  createdAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
});

export const MessageCreateSchema = MessageSchema.omit({
  id: true,
  subscriberId: true,
  status: true,
  createdAt: true,
  deliverAt: true,
});

export const MessageUpdateSchema = z.object({
  status: MessageStatusSchema.optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  deliverAt: z.string().nullable().optional(),
});

export const SubscriberParamsSchema = z.object({
  subscriberId: z
    .cuid2()
    .openapi({ param: { name: "subscriberId", in: "path", required: true } }),
});

export const MessageParamsSchema = SubscriberParamsSchema.extend({
  messageId: z
    .cuid2()
    .openapi({ param: { name: "messageId", in: "path", required: true } }),
});

export const MessageListQuerySchema = PaginationQuerySchema.extend({
  // Sorting
  sortBy: createSortBySchema(["createdAt", "deliverAt", "status"], "createdAt"),
  order: SortOrderSchema,
  // Filtering
  status: z
    .preprocess((val) => {
      if (val === undefined || val === null) {
        return;
      }
      // Handle array (from multiple query params like ?status=PENDING&status=DELIVERED)
      if (Array.isArray(val)) {
        return val;
      }
      // Handle string (could be single value or comma-separated)
      if (typeof val === "string") {
        const parts = val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        return parts.length === 1 ? parts[0] : parts;
      }

      return val;
    }, z.union([MessageStatusSchema, z.array(MessageStatusSchema)]).optional())
    .openapi({
      example: ["PENDING", "DELIVERED"],
      description:
        "Filter by message status (can specify multiple as comma-separated or multiple query params)",
    }),
  eventTypeId: z.cuid2().optional().openapi({
    example: "cm3...",
    description: "Filter by event type ID",
  }),
  deliverAtFrom: z.iso.datetime().optional().openapi({
    example: "2024-01-01T00:00:00Z",
    description: "Filter messages with deliverAt >= this date",
  }),
  deliverAtTo: z.iso.datetime().optional().openapi({
    example: "2024-12-31T23:59:59Z",
    description: "Filter messages with deliverAt <= this date",
  }),
});
