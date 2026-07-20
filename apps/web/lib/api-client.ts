import hcWithType from "@xwebhook/api-client";
import { xiorFetchAdapter } from "../configs/xior";

export const hc = hcWithType("/", {
  fetch: xiorFetchAdapter,
});
