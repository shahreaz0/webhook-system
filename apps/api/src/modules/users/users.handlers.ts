import type { RouteHandler } from "@hono/zod-openapi";
import { prisma } from "@webhook/database";
import { HTTPException } from "hono/http-exception";
import type { AppBindings } from "@/api/lib/types";
import type { GetMeRoute, RemoveMeRoute, UpdateMeRoute } from "./users.routes";

// ----------------------------
// Get Current User
// ----------------------------
export const getMe: RouteHandler<GetMeRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");

  const user = await prisma.user.findUnique({
    where: { id: jwtPayload.id },
    omit: {
      password: true,
    },
  });

  if (!user) {
    throw new HTTPException(404, {
      message: "User not found",
      cause: { status: "error" },
    });
  }

  return c.json({ status: "success", data: user }, 200);
};

// ----------------------------
// Update Current User
// ----------------------------
export const updateMe: RouteHandler<UpdateMeRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const updates = c.req.valid("json");

  const user = await prisma.user.findUnique({
    where: { id: jwtPayload.id },
  });

  if (!user) {
    throw new HTTPException(404, {
      message: "User not found",
      cause: { status: "error" },
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id: jwtPayload.id },
    data: updates,
  });

  return c.json({ status: "success" as const, data: updatedUser }, 200);
};

// ----------------------------
// Delete Current User
// ----------------------------
export const removeMe: RouteHandler<RemoveMeRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");

  const user = await prisma.user.findUnique({
    where: { id: jwtPayload.id },
  });

  if (!user) {
    throw new HTTPException(404, {
      message: "User not found",
      cause: { status: "error" },
    });
  }

  await prisma.user.delete({ where: { id: jwtPayload.id } });

  return c.json(
    { status: "success" as const, data: { id: jwtPayload.id } },
    200
  );
};
