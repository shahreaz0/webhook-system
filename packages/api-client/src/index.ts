import type { AppType } from "@webhook/api/src/app";
import { hc } from "hono/client";

const client = hc<AppType>("");
export type Client = typeof client;

export default function hcWithType(...args: Parameters<typeof hc>): Client {
  return hc<AppType>(...args);
}
