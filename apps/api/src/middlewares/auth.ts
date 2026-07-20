import { env } from "@xwebhook/env";
import { jwt } from "hono/jwt";

export function auth() {
  return jwt({ secret: env.JWT_SECRET, alg: "HS512" });
}
