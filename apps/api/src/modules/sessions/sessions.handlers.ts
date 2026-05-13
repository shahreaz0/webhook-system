import type { RouteHandler } from "@hono/zod-openapi";
import { prisma } from "@webhook/database";
import { HTTPException } from "hono/http-exception";
import type { AppBindings } from "@/lib/types";
import type {
  GetOneRoute,
  ListRoute,
  RemoveAllRoute,
  RemoveRoute,
} from "./sessions.routes";

// ----------------------------
// List Sessions
// ----------------------------
export const list: RouteHandler<ListRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const {
    page = 1,
    perPage = 10,
    sortBy = "createdAt",
    order = "desc",
  } = c.req.valid("query");

  const sessions = await prisma.session.findMany({
    where: {
      userId: jwtPayload.id,
      deletedAt: null,
    },
    orderBy: {
      [sortBy]: order,
    },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return c.json({ success: true, data: sessions }, 200);
};

// ----------------------------
// Get One Session
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const { id } = c.req.valid("param");

  const session = await prisma.session.findFirst({
    where: {
      id,
      userId: jwtPayload.id,
      deletedAt: null,
    },
  });

  if (!session) {
    throw new HTTPException(404, {
      message: "Session not found",
      cause: { success: false },
    });
  }

  return c.json({ success: true, data: session }, 200);
};

// ----------------------------
// Delete Session
// ----------------------------
export const remove: RouteHandler<RemoveRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const { id } = c.req.valid("param");

  const session = await prisma.session.findFirst({
    where: {
      id,
      userId: jwtPayload.id,
      deletedAt: null,
    },
  });

  if (!session) {
    throw new HTTPException(404, {
      message: "Session not found",
      cause: { success: false },
    });
  }

  await prisma.session.delete({
    where: { id },
  });

  return c.json({ success: true, data: { id } }, 200);
};

// ----------------------------
// Delete All Sessions
// ----------------------------
export const removeAll: RouteHandler<RemoveAllRoute, AppBindings> = async (
  c
) => {
  const jwtPayload = c.get("jwtPayload");

  // Get current session token from the request
  const authHeader = c.req.header("Authorization");
  const currentToken = authHeader?.replace("Bearer ", "");

  const result = await prisma.session.deleteMany({
    where: {
      userId: jwtPayload.id,
      deletedAt: null,
      // Don't delete the current session
      ...(currentToken && { token: { not: currentToken } }),
    },
  });

  return c.json({ success: true, data: { count: result.count } }, 200);
};
