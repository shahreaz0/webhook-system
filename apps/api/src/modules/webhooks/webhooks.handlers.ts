import type { RouteHandler } from "@hono/zod-openapi";
import { prisma } from "@webhook/database";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { buildOrderBy, buildPagination } from "@/api/lib/common-schemas";
import type { AppBindings, AppRouteHandler } from "@/api/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./webhooks.routes";
import { WebhookSchema } from "./webhooks.schemas";
import { buildWebhookFilters } from "./webhooks.utils";

// ----------------------------
// List Webhooks for Subscriber
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
  if (!subscriber || subscriber.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { success: false },
    });
  }

  // Build filters and query options
  const where = buildWebhookFilters(params.subscriberId, query);
  const orderBy = buildOrderBy(
    query.sortBy || "createdAt",
    query.order || "desc"
  );
  const pagination = buildPagination(query.page, query.perPage);

  const webhooks = await prisma.webhook.findMany({
    where,
    orderBy,
    ...pagination,
    include: { webhookEventTypes: true },
  });
  const data = webhooks.map((w) => ({
    ...w,
    eventTypes: w.webhookEventTypes.map((et) => et.eventTypeId) ?? [],
    subscriberId: w.subscriberId,
  }));
  const parsed = z.array(WebhookSchema).parse(data);
  return c.json({ success: true, data: parsed });
};

// ----------------------------
// Create Webhook for Subscriber
// ----------------------------
export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.subscriberId },
    include: { application: true },
  });

  if (!subscriber || subscriber.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { success: false },
    });
  }

  const { eventTypes, ...rest } = body;

  const events = await prisma.eventType.findMany({
    where: { id: { in: eventTypes }, archived: false },
  });

  if (events.length !== eventTypes.length) {
    throw new HTTPException(404, {
      message: "EventTypes not found or archived",
      cause: { success: false },
    });
  }

  const created = await prisma.webhook.create({
    data: {
      ...rest,
      subscriberId: params.subscriberId,
      webhookEventTypes: {
        create: events.map((et) => ({ eventTypeId: et.id })),
      },
    },

    include: { webhookEventTypes: true },
  });

  const result = {
    ...created,
    eventTypes: created.webhookEventTypes.map((et) => et.eventTypeId),
    subscriberId:
      created.subscriberId === null ? undefined : created.subscriberId,
  };

  const parsed = WebhookSchema.parse(result);

  return c.json({ success: true, data: parsed }, 201);
};

// ----------------------------
// Get One Webhook for Subscriber
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  // Ensure the app user exists and belongs to the authenticated user
  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.subscriberId },
    include: { application: true },
  });
  if (!subscriber || subscriber.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { success: false },
    });
  }
  const webhook = await prisma.webhook.findFirst({
    where: { subscriberId: params.subscriberId, id: params.webhookId },
    include: { webhookEventTypes: true },
  });
  if (!webhook) {
    throw new HTTPException(404, {
      message: "Webhook not found",
      cause: { success: false },
    });
  }
  const result = {
    ...webhook,
    eventTypes: webhook.webhookEventTypes
      ? webhook.webhookEventTypes.map((et) => et.eventTypeId)
      : [],
    subscriberId:
      webhook.subscriberId === null ? undefined : webhook.subscriberId,
    createdAt: webhook.createdAt.toISOString(),
    updatedAt: webhook.updatedAt.toISOString(),
  };
  const parsed = WebhookSchema.parse(result);
  return c.json({ success: true, data: parsed }, 200);
};

// ----------------------------
// Update Webhook for Subscriber
// ----------------------------
export const patch: RouteHandler<PatchRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.subscriberId },
    include: { application: true },
  });

  if (!subscriber || subscriber.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { success: false },
    });
  }

  const webhook = await prisma.webhook.findFirst({
    where: { subscriberId: params.subscriberId, id: params.webhookId },
    include: { webhookEventTypes: true },
  });

  if (!webhook) {
    throw new HTTPException(404, {
      message: "Webhook not found",
      cause: { success: false },
    });
  }

  const { eventTypes: updateEventTypes, ...updateRest } = body;

  const updateData: Record<string, unknown> = { ...updateRest };

  if (params.subscriberId !== undefined) {
    updateData.subscriberId = params.subscriberId;
  }

  if (updateEventTypes) {
    updateData.webhookEventTypes = {
      create: updateEventTypes.map((id) => ({ eventTypeId: id })),
    };
  }
  const edited = await prisma.webhook.update({
    where: { id: params.webhookId },
    data: updateData,
    include: { webhookEventTypes: true },
  });

  const result = {
    ...edited,
    eventTypes: edited.webhookEventTypes
      ? edited.webhookEventTypes.map((et) => et.eventTypeId)
      : [],
    subscriberId:
      edited.subscriberId === null ? undefined : edited.subscriberId,
  };

  const parsed = WebhookSchema.parse(result);

  return c.json({ success: true, data: parsed }, 200);
};

// ----------------------------
// Delete Webhook for Subscriber
// ----------------------------
export const remove: RouteHandler<RemoveRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.subscriberId },
    include: { application: true },
  });

  if (!subscriber || subscriber.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { success: false },
    });
  }

  const webhook = await prisma.webhook.findFirst({
    where: { subscriberId: params.subscriberId, id: params.webhookId },
  });

  if (!webhook) {
    throw new HTTPException(404, {
      message: "Webhook not found",
      cause: { success: false },
    });
  }

  await prisma.webhook.delete({ where: { id: params.webhookId } });

  return c.json({ success: true, data: { id: params.webhookId } }, 200);
};
