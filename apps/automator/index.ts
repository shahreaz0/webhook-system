import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) =>
  c.json({
    status: "OK",
    service: "automator service",
    timestamp: Date.now(),
  })
);

app.post("/webhook", async (c) => {
  const secret = c.req.header("x-webhook-secret");

  console.log("webhook fired ====================================");

  console.log("secret", secret);

  if (secret !== "supersecret") {
    return c.json("Unauthorized", 401);
  }

  const body = await c.req.json();

  console.log("body", body);

  if (body.event === "user.created") {
    console.log({ message: `email sent to ${body.data.name}` });
  }

  return c.json({ message: "OK" });
});

export default {
  port: 8099,
  fetch: app.fetch,
};

console.log("Server is running at 8099");
