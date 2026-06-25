import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { handle } from "@hono/node-server/vercel";

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.get("/api/health", (c) => {
  return c.json({ ok: true, bodyLimit: true, time: Date.now() });
});

export default handle(app);
