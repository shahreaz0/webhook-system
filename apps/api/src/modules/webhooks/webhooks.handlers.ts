import type { RouteHandler } from "@hono/zod-openapi";
import { prisma } from "@webhook/database";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { buildOrderBy, buildPagination } from "@/lib/common-schemas";
import type { AppBindings, AppRouteHandler } from "@/lib/types";
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
// List Webhooks for AppUser
// ----------------------------
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const query = c.req.valid("query");

  // Ensure the app user exists and its application belongs to the authenticated user
  const appUser = await prisma.appUser.findUnique({
    where: { id: params.appUserId },
    include: { application: true },
  });
  if (!appUser || appUser.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }

  // Build filters and query options
  const where = buildWebhookFilters(params.appUserId, query);
  const orderBy = buildOrderBy(
    query.sortBy || "createdAt",
    query.order || "desc"
  );
  const pagination = buildPagination(query.page, query.perPage);

  const webhooks = await prisma.webhook.findMany({
    where,
    orderBy,
    ...pagination,
    include: { eventTypes: true },
  });
  const data = webhooks.map((w) => ({
    ...w,
    eventTypes: w.eventTypes.map((et) => et.eventTypeId) ?? [],
    appUserId: w.appUserId,
  }));
  const parsed = z.array(WebhookSchema).parse(data);
  return c.json({ success: true, data: parsed });
};

// ----------------------------
// Create Webhook for AppUser
// ----------------------------
export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const appUser = await prisma.appUser.findUnique({
    where: { id: params.appUserId },
    include: { application: true },
  });

  if (!appUser || appUser.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
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
      appUserId: params.appUserId,
      eventTypes: {
        create: events.map((et) => ({ eventTypeId: et.id })),
      },
    },

    include: { eventTypes: true },
  });

  const result = {
    ...created,
    eventTypes: created.eventTypes.map((et) => et.eventTypeId),
    appUserId: created.appUserId === null ? undefined : created.appUserId,
  };

  const parsed = WebhookSchema.parse(result);

  return c.json({ success: true, data: parsed }, 201);
};

// ----------------------------
// Get One Webhook for AppUser
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  // Ensure the app user exists and belongs to the authenticated user
  const appUser = await prisma.appUser.findUnique({
    where: { id: params.appUserId },
    include: { application: true },
  });
  if (!appUser || appUser.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }
  const webhook = await prisma.webhook.findFirst({
    where: { appUserId: params.appUserId, id: params.webhookId },
    include: { eventTypes: true },
  });
  if (!webhook) {
    throw new HTTPException(404, {
      message: "Webhook not found",
      cause: { success: false },
    });
  }
  const result = {
    ...webhook,
    eventTypes: webhook.eventTypes ?? [],
    appUserId: webhook.appUserId === null ? undefined : webhook.appUserId,
    createdAt: webhook.createdAt.toISOString(),
    updatedAt: webhook.updatedAt.toISOString(),
  };
  const parsed = WebhookSchema.parse(result);
  return c.json({ success: true, data: parsed }, 200);
};

// ----------------------------
// Update Webhook for AppUser
// ----------------------------
export const patch: RouteHandler<PatchRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const appUser = await prisma.appUser.findUnique({
    where: { id: params.appUserId },
    include: { application: true },
  });

  if (!appUser || appUser.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }

  const webhook = await prisma.webhook.findFirst({
    where: { appUserId: params.appUserId, id: params.webhookId },
    include: { eventTypes: true },
  });

  if (!webhook) {
    throw new HTTPException(404, {
      message: "Webhook not found",
      cause: { success: false },
    });
  }

  const { eventTypes: updateEventTypes, ...updateRest } = body;

  const updateData: Record<string, unknown> = { ...updateRest };

  if (params.appUserId !== undefined) {
    updateData.appUserId = params.appUserId;
  }

  if (updateEventTypes) {
    updateData.eventTypes = {
      create: updateEventTypes.map((id) => ({ eventTypeId: id })),
    };
  }
  const edited = await prisma.webhook.update({
    where: { id: params.webhookId },
    data: updateData,
    include: { eventTypes: true },
  });

  const result = {
    ...edited,
    eventTypes: edited.eventTypes ?? [],
    appUserId: edited.appUserId === null ? undefined : edited.appUserId,
  };

  const parsed = WebhookSchema.parse(result);

  return c.json({ success: true, data: parsed }, 200);
};

// ----------------------------
// Delete Webhook for AppUser
// ----------------------------
export const remove: RouteHandler<RemoveRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");

  const appUser = await prisma.appUser.findUnique({
    where: { id: params.appUserId },
    include: { application: true },
  });

  if (!appUser || appUser.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }

  const webhook = await prisma.webhook.findFirst({
    where: { appUserId: params.appUserId, id: params.webhookId },
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
