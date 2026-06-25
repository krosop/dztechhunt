import { handle } from "@hono/node-server/vercel";

let app: any;
let error: any;

async function init() {
  try {
    const mod = await import("../server/app");
    app = mod.app;
  } catch (e: any) {
    error = e;
  }
}

const initPromise = init();

export default async function (req: any, res: any) {
  await initPromise;
  
  if (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message, stack: error.stack }));
    return;
  }
  
  return handle(app)(req, res);
}
