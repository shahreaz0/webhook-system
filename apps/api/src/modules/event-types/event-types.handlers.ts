import type { RouteHandler } from "@hono/zod-openapi";
import type { Prisma } from "@xwebhook/database";
import { prisma } from "@xwebhook/database";
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
} from "./event-types.routes";
import { EventTypeSchema } from "./event-types.schemas";

// ----------------------------
// List Event Types
// ----------------------------
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");
  const query = c.req.valid("query");

  // Verify application ownership
  const application = await prisma.application.findUnique({
    where: { id: params.applicationId },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }

  // Build where clause
  const where: Prisma.EventTypeWhereInput = {
    applicationId: params.applicationId,
  };

  // Filter by archived status
  if (query.archived !== undefined) {
    where.archived = query.archived;
  }

  // Filter by deprecated status
  if (query.deprecated !== undefined) {
    where.deprecated = query.deprecated;
  }

  // Filter by groupName
  if (query.groupName) {
    where.groupName = query.groupName;
  }

  // Search by name (case-insensitive)
  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }

  // Build orderBy and pagination
  const orderBy = buildOrderBy(
    query.sortBy || "createdAt",
    query.order || "desc"
  );
  const pagination = buildPagination(query.page, query.perPage);

  const eventTypes = await prisma.eventType.findMany({
    where,
    orderBy,
    ...pagination,
  });

  const parsedEventTypes = z.array(EventTypeSchema).parse(eventTypes);

  return c.json({
    status: "success" as const,
    data: parsedEventTypes,
  });
};

// ----------------------------
// Create Event Type
// ----------------------------
export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  // Verify application ownership
  const application = await prisma.application.findUnique({
    where: { id: params.applicationId },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }

  const createdEventType = await prisma.eventType.create({
    data: {
      ...body,
      applicationId: params.applicationId,
    },
  });

  return c.json({ status: "success" as const, data: createdEventType }, 201);
};

// ----------------------------
// Get One Event Type
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");

  // Verify application ownership
  const application = await prisma.application.findUnique({
    where: { id: params.applicationId },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }

  const eventType = await prisma.eventType.findFirst({
    where: { id: params.eventTypeId, applicationId: params.applicationId },
  });

  if (!eventType) {
    throw new HTTPException(404, {
      message: "Event type not found",
      cause: { status: "error" },
    });
  }

  return c.json({ status: "success" as const, data: eventType }, 200);
};

// ----------------------------
// Update Event Type
// ----------------------------
export const patch: RouteHandler<PatchRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");
  const updates = c.req.valid("json");

  // Verify application ownership
  const application = await prisma.application.findUnique({
    where: { id: params.applicationId },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }

  const eventType = await prisma.eventType.findFirst({
    where: { id: params.eventTypeId, applicationId: params.applicationId },
  });

  if (!eventType) {
    throw new HTTPException(404, {
      message: "Event type not found",
      cause: { status: "error" },
    });
  }

  const editedEventType = await prisma.eventType.update({
    where: { id: params.eventTypeId },
    data: updates,
  });

  return c.json({ status: "success" as const, data: editedEventType }, 200);
};

// ----------------------------
// Delete Event Type
// ----------------------------
export const remove: RouteHandler<RemoveRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");

  // Verify application ownership
  const application = await prisma.application.findUnique({
    where: { id: params.applicationId },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }

  const eventType = await prisma.eventType.findFirst({
    where: { id: params.eventTypeId, applicationId: params.applicationId },
  });

  if (!eventType) {
    throw new HTTPException(404, {
      message: "Event type not found",
      cause: { status: "error" },
    });
  }

  await prisma.eventType.delete({ where: { id: params.eventTypeId } });

  return c.json(
    { status: "success" as const, data: { id: params.eventTypeId } },
    200
  );
};
