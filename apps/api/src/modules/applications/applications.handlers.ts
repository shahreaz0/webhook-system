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
} from "./applications.routes";
import { ApplicationSchema } from "./applications.schemas";

// ----------------------------
// List Applications
// ----------------------------
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const query = c.req.valid("query");

  // Build where clause
  const where: Prisma.ApplicationWhereInput = {
    userId: jwtPayload.id,
  };

  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }

  // Build orderBy and pagination
  const orderBy = buildOrderBy(
    query.sortBy || "createdAt",
    query.order || "desc"
  );

  const pagination = buildPagination(query.page, query.perPage);

  const applications = await prisma.application.findMany({
    where,
    orderBy,
    ...pagination,
  });

  const parsedApps = z.array(ApplicationSchema).parse(applications);

  return c.json({
    status: "success" as const,
    data: parsedApps,
  });
};

// ----------------------------
// Create Application
// ----------------------------
export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");

  const body = c.req.valid("json");

  const createdApp = await prisma.application.create({
    data: {
      ...body,
      userId: jwtPayload.id,
    },
  });

  return c.json({ status: "success" as const, data: createdApp }, 201);
};

// ----------------------------
// Get One Application
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      user: true,
    },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }

  return c.json({ status: "success" as const, data: application }, 200);
};

// ----------------------------
// Update Application
// ----------------------------
export const patch: RouteHandler<PatchRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");
  const updates = c.req.valid("json");

  const application = await prisma.application.findUnique({
    where: { id: params.id },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }

  const editedApp = await prisma.application.update({
    where: { id: params.id },
    data: updates,
  });

  return c.json({ status: "success" as const, data: editedApp }, 200);
};

// ----------------------------
// Delete Application
// ----------------------------
export const remove: RouteHandler<RemoveRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");

  const application = await prisma.application.findUnique({
    where: { id: params.id },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { status: "error" },
    });
  }

  await prisma.application.delete({ where: { id: params.id } });

  return c.json({ status: "success" as const, data: { id: params.id } }, 200);
};
