import type { RouteHandler } from "@hono/zod-openapi";
import type { Prisma } from "@webhook/database";
import { prisma } from "@webhook/database";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { messagesQueue } from "@/configs/bullmq";
import { buildOrderBy, buildPagination } from "@/lib/common-schemas";
import type { AppBindings, AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
} from "./messages.routes";
import { MessageSchema } from "./messages.schemas";
import { buildMessageFilters } from "./messages.utils";

// ----------------------------
// List Messages for Subscriber
// ----------------------------
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const query = c.req.valid("query");

  // Ensure the app user exists and its application belongs to the authenticated user
  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.subscriberId },
    include: { application: true },
  });
  if (subscriber?.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { success: false },
    });
  }

  // Build filters and query options
  const where = buildMessageFilters(params.subscriberId, query);
  const orderBy = buildOrderBy(
    query.sortBy || "createdAt",
    query.order || "desc"
  );
  const pagination = buildPagination(query.page, query.perPage);

  const messages = await prisma.message.findMany({
    where,
    orderBy,
    ...pagination,
  });

  const data = messages.map((m) => ({
    ...m,
    subscriberId: m.subscriberId,
    deliverAt: m.deliverAt ? m.deliverAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
    payload: m.payload as Record<string, unknown>,
  }));
  const parsed = z.array(MessageSchema).parse(data);
  return c.json({ success: true, data: parsed });
};

// ----------------------------
// Create Message for Subscriber
// ----------------------------
export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.subscriberId },
    include: { application: true },
  });

  if (subscriber?.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { success: false },
    });
  }

  const eventType = await prisma.eventType.findUnique({
    where: { id: body.eventTypeId, archived: false },
    select: { name: true },
  });

  if (!eventType) {
    throw new HTTPException(404, {
      message: "Event Type not found or archived",
      cause: { success: false },
    });
  }

  const created = await prisma.message.create({
    data: {
      eventTypeId: body.eventTypeId,
      payload: body.payload as Prisma.InputJsonValue,
      subscriberId: params.subscriberId,
    },
  });

  await messagesQueue.add("messages", {
    message: { ...created, eventName: eventType.name },
    session: jwt,
  });

  const result = {
    ...created,
    subscriberId: created.subscriberId ?? undefined,
    deliverAt: created.deliverAt ? created.deliverAt.toISOString() : null,
    createdAt: created.createdAt.toISOString(),
    payload: created.payload as Record<string, unknown>,
  };

  const parsed = MessageSchema.parse(result);

  return c.json({ success: true, data: parsed }, 201);
};

// ----------------------------
// Get One Message for Subscriber
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  // Ensure the app user exists and belongs to the authenticated user
  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.subscriberId },
    include: { application: true },
  });
  if (subscriber?.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { success: false },
    });
  }
  const message = await prisma.message.findFirst({
    where: { subscriberId: params.subscriberId, id: params.messageId },
  });
  if (!message) {
    throw new HTTPException(404, {
      message: "Message not found",
      cause: { success: false },
    });
  }
  const result = {
    ...message,
    subscriberId: message.subscriberId ?? undefined,
    deliverAt: message.deliverAt ? message.deliverAt.toISOString() : null,
    createdAt: message.createdAt.toISOString(),
    payload: message.payload as Record<string, unknown>,
  };
  const parsed = MessageSchema.parse(result);
  return c.json({ success: true, data: parsed }, 200);
};

// ----------------------------
// Update Message for Subscriber
// ----------------------------
export const patch: RouteHandler<PatchRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.subscriberId },
    include: { application: true },
  });

  if (subscriber?.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { success: false },
    });
  }

  const message = await prisma.message.findFirst({
    where: { subscriberId: params.subscriberId, id: params.messageId },
  });

  if (!message) {
    throw new HTTPException(404, {
      message: "Message not found",
      cause: { success: false },
    });
  }

  const edited = await prisma.message.update({
    where: { id: params.messageId },
    data: {
      ...body,
      // biome-ignore lint/suspicious/noExplicitAny: Prisma InputJsonValue casting
      payload: body.payload ? (body.payload as any) : undefined,
    },
  });

  const result = {
    ...edited,
    subscriberId: edited.subscriberId ?? undefined,
    deliverAt: edited.deliverAt ? edited.deliverAt.toISOString() : null,
    createdAt: edited.createdAt.toISOString(),
    payload: edited.payload as Record<string, unknown>,
  };

  const parsed = MessageSchema.parse(result);

  return c.json({ success: true, data: parsed }, 200);
};
