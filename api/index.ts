import { Hono } from "hono";

const app = new Hono();

app.all("*", (c) => {
  return c.json({ 
    ok: true, 
    path: c.req.path,
    url: c.req.url,
    method: c.req.method 
  });
});

export default async function handler(req: Request) {
  try {
    return await app.fetch(req);
  } catch (err: any) {
    console.error("[API ERROR]", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown", stack: err?.stack }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
