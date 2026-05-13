import type { RouteHandler } from "@hono/zod-openapi";
import type { Prisma } from "@webhook/database";
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
} from "./app-users.routes";
import { AppUserSchema } from "./app-users.schemas";

// ----------------------------
// List AppUsers
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
      cause: { success: false },
    });
  }

  // Build where clause
  const where: Prisma.AppUserWhereInput = {
    applicationId: params.applicationId,
  };
  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: "insensitive" } },
      { userId: { contains: query.search, mode: "insensitive" } },
    ];
  }

  // Build orderBy and pagination
  const orderBy = buildOrderBy(
    query.sortBy || "createdAt",
    query.order || "desc"
  );
  const pagination = buildPagination(query.page, query.perPage);

  const appUsers = await prisma.appUser.findMany({
    where,
    orderBy,
    ...pagination,
  });

  const parsed = z.array(AppUserSchema).parse(appUsers);
  return c.json({ success: true, data: parsed });
};

// ----------------------------
// Create AppUser
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
      cause: { success: false },
    });
  }
  const created = await prisma.appUser.create({
    data: { ...body, applicationId: params.applicationId },
  });
  return c.json({ success: true, data: created }, 201);
};

// ----------------------------
// Get One AppUser
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
      cause: { success: false },
    });
  }
  const appUser = await prisma.appUser.findFirst({
    where: { applicationId: params.applicationId, id: params.appUserId },
    include: {
      application: true,
    },
  });

  if (!appUser) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }
  return c.json({ success: true, data: appUser }, 200);
};

// ----------------------------
// Update AppUser
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
      cause: { success: false },
    });
  }
  const appUser = await prisma.appUser.findFirst({
    where: { applicationId: params.applicationId, id: params.appUserId },
  });
  if (!appUser) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }
  const edited = await prisma.appUser.update({
    where: { id: params.appUserId },
    data: body,
  });
  return c.json({ success: true, data: edited }, 200);
};

// ----------------------------
// Delete AppUser
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
      cause: { success: false },
    });
  }
  const appUser = await prisma.appUser.findFirst({
    where: { applicationId: params.applicationId, id: params.appUserId },
  });
  if (!appUser) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }
  await prisma.appUser.delete({ where: { id: params.appUserId } });
  return c.json({ success: true, data: { id: params.appUserId } }, 200);
};
