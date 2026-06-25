import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const diagnostics: any = {
    nodeVersion: process.version,
    env: Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('PASSWORD') && !k.includes('TOKEN')),
    cwd: process.cwd(),
    time: new Date().toISOString(),
  };

  // Try importing modules one by one
  const modules = [
    "hono",
    "@trpc/server",
    "superjson",
    "zod",
    "drizzle-orm",
    "drizzle-orm/pg-core",
    "postgres",
  ];

  for (const mod of modules) {
    try {
      await import(mod);
      diagnostics[`import_${mod.replace(/[^a-z0-9]/g, '_')}`] = "OK";
    } catch (e: any) {
      diagnostics[`import_${mod.replace(/[^a-z0-9]/g, '_')}`] = `FAIL: ${e.message}`;
    }
  }

  // Try importing our server modules
  try {
    await import("../server/lib/env");
    diagnostics.import_server_lib_env = "OK";
  } catch (e: any) {
    diagnostics.import_server_lib_env = `FAIL: ${e.message}`;
  }

  try {
    await import("../server/lib/supabase");
    diagnostics.import_server_lib_supabase = "OK";
  } catch (e: any) {
    diagnostics.import_server_lib_supabase = `FAIL: ${e.message}`;
  }

  try {
    await import("../db/schema");
    diagnostics.import_db_schema = "OK";
  } catch (e: any) {
    diagnostics.import_db_schema = `FAIL: ${e.message}`;
  }

  try {
    await import("../server/queries/connection");
    diagnostics.import_server_queries_connection = "OK";
  } catch (e: any) {
    diagnostics.import_server_queries_connection = `FAIL: ${e.message}`;
  }

  try {
    await import("../server/middleware");
    diagnostics.import_server_middleware = "OK";
  } catch (e: any) {
    diagnostics.import_server_middleware = `FAIL: ${e.message}`;
  }

  try {
    await import("../server/router");
    diagnostics.import_server_router = "OK";
  } catch (e: any) {
    diagnostics.import_server_router = `FAIL: ${e.message}`;
  }

  try {
    await import("../server/app");
    diagnostics.import_server_app = "OK";
  } catch (e: any) {
    diagnostics.import_server_app = `FAIL: ${e.message}`;
  }

  return c.json(diagnostics);
});

export default app;
