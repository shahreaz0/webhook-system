import type { RouteHandler } from "@hono/zod-openapi";
import type { Prisma } from "@webhook/database";
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
} from "./subscribers.routes";
import { SubscriberSchema } from "./subscribers.schemas";

// ----------------------------
// List Subscribers
// ----------------------------
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const query = c.req.valid("query");

  // Ensure the application belongs to the user
  const app = await prisma.application.findUnique({
    where: { id: params.applicationId },
  });
  if (!app || app.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }

  // Build where clause
  const where: Prisma.SubscriberWhereInput = {
    applicationId: params.applicationId,
  };
  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: "insensitive" } },
      { referenceId: { contains: query.search, mode: "insensitive" } },
    ];
  }

  // Build orderBy and pagination
  const orderBy = buildOrderBy(
    query.sortBy || "createdAt",
    query.order || "desc"
  );
  const pagination = buildPagination(query.page, query.perPage);

  const subscribers = await prisma.subscriber.findMany({
    where,
    orderBy,
    ...pagination,
  });

  const parsed = z.array(SubscriberSchema).parse(subscribers);
  return c.json({ status: "success" as const, data: parsed });
};

// ----------------------------
// Create Subscriber
// ----------------------------
export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");
  // Ensure application belongs to the authenticated user
  const app = await prisma.application.findUnique({
    where: { id: params.applicationId },
  });
  if (!app || app.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }
  const created = await prisma.subscriber.create({
    data: { ...body, applicationId: params.applicationId },
  });
  return c.json({ status: "success" as const, data: created }, 201);
};

// ----------------------------
// Get One Subscriber
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  // Ensure the application belongs to the user
  const app = await prisma.application.findUnique({
    where: { id: params.applicationId },
  });
  if (!app || app.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }
  const subscriber = await prisma.subscriber.findFirst({
    where: { applicationId: params.applicationId, id: params.subscriberId },
    include: {
      application: true,
    },
  });

  if (!subscriber) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { status: "error" },
    });
  }
  return c.json({ status: "success" as const, data: subscriber }, 200);
};

// ----------------------------
// Update Subscriber
// ----------------------------
export const patch: RouteHandler<PatchRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");
  // Ensure the application belongs to the user
  const app = await prisma.application.findUnique({
    where: { id: params.applicationId },
  });
  if (!app || app.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }
  const subscriber = await prisma.subscriber.findFirst({
    where: { applicationId: params.applicationId, id: params.subscriberId },
  });
  if (!subscriber) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { status: "error" },
    });
  }
  const edited = await prisma.subscriber.update({
    where: { id: params.subscriberId },
    data: body,
  });
  return c.json({ status: "success" as const, data: edited }, 200);
};

// ----------------------------
// Delete Subscriber
// ----------------------------
export const remove: RouteHandler<RemoveRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  // Ensure the application belongs to the user
  const app = await prisma.application.findUnique({
    where: { id: params.applicationId },
  });
  if (!app || app.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }
  const subscriber = await prisma.subscriber.findFirst({
    where: { applicationId: params.applicationId, id: params.subscriberId },
  });
  if (!subscriber) {
    throw new HTTPException(404, {
      message: "Subscriber not found",
      cause: { status: "error" },
    });
  }
  await prisma.subscriber.delete({ where: { id: params.subscriberId } });
  return c.json(
    { status: "success" as const, data: { id: params.subscriberId } },
    200
  );
};
