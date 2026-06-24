import { app } from "../server/app";

export default async function handler(req: Request) {
  try {
    return await app.fetch(req);
  } catch (err: any) {
    console.error("[API FETCH ERROR]", err);
    return new Response(JSON.stringify({ error: err?.message || "Unknown error", stack: err?.stack }), { status: 500 });
  }
}
