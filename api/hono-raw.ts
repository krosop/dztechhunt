import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ ok: true, framework: "hono-raw", time: Date.now() });
});

// Manual Node.js handler conversion without @hono/node-server/vercel
export default async function handler(req: any, res: any) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const request = new Request(url, {
    method: req.method,
    headers: new Headers(req.headers),
    body: req.body,
  });
  
  const response = await app.fetch(request);
  
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  
  const body = await response.text();
  res.end(body);
}
