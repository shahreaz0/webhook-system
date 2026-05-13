import { Scalar } from "@scalar/hono-api-reference";
import packageJSON from "../../package.json";
import type { AppOpenAPI } from "./types";

export function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "xwebhook",
      description: "Webhook as a Service",
    },

    security: [{ Bearer: [] }],
  });

  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
    description: "Use the Bearer token for authentication",
    bearerFormat: "JWT",
  });

  app.get(
    "/reference",
    Scalar({
      // spec: {
      //   url: "/doc",
      // },

      url: "/doc",

      metaData: {
        title: "xwebhook",
        description: "xwebhook - a webhook service",
      },
    })
  );
}
