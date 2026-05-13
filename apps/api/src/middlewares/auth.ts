import { jwt } from "hono/jwt";
import { env } from "@/lib/env";

export function auth() {
  return jwt({ secret: env.JWT_SECRET, alg: "HS512" });
}
