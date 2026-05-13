import path from "node:path";
import dotenv from "dotenv";
import { ZodError, z } from "zod";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "test" ? ".env.test" : ".env"
  ),
});

// Also try root if not in cwd (for monorepo)
dotenv.config({
  path: path.resolve(
    process.cwd(),
    "../../",
    process.env.NODE_ENV === "test" ? ".env.test" : ".env"
  ),
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ]),
  PORT: z.coerce.number().default(8088),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string(),
  REDIS_URL: z.url(),
});

function getEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error("Invalid env");
    console.error(error instanceof ZodError && z.prettifyError(error));

    process.exit(1);
  }
}

export const env = getEnv();
