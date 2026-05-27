import type { MessageStatus, Prisma } from "@webhook/database";
import type { z } from "zod";
import type { MessageListQuerySchema } from "./messages.schemas";

export function buildMessageFilters(
  subscriberId: string,
  query: Partial<
    Pick<
      z.infer<typeof MessageListQuerySchema>,
      "status" | "eventTypeId" | "deliverAtFrom" | "deliverAtTo"
    >
  >
) {
  const where: Prisma.MessageWhereInput = {
    subscriberId,
  };

  // Filter by status
  if (query.status) {
    const statuses = Array.isArray(query.status)
      ? query.status
      : [query.status];

    // Ensure status values are of MessageStatus type
    const statusValues = statuses.filter(
      (s): s is MessageStatus => typeof s === "string"
    );

    if (statusValues.length === 1) {
      where.status = statusValues[0];
    } else if (statusValues.length > 1) {
      where.status = { in: statusValues };
    }
  }

  // Filter by eventTypeId
  if (query.eventTypeId) {
    where.eventTypeId = query.eventTypeId;
  }

  // Filter by deliverAt date range
  if (query.deliverAtFrom || query.deliverAtTo) {
    where.deliverAt = {};
    if (query.deliverAtFrom) {
      where.deliverAt.gte = new Date(query.deliverAtFrom);
    }
    if (query.deliverAtTo) {
      where.deliverAt.lte = new Date(query.deliverAtTo);
    }
  }

  return where;
}
