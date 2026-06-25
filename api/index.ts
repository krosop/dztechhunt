import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { handle } from "@hono/node-server/vercel";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.get("/api/health", (c) => {
  return c.json({ ok: true, trpcAdapter: true, time: Date.now() });
});

export default handle(app);
