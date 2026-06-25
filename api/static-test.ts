// Static import test - catches module import errors
import { app } from "../server/app";

export default async function handler(req: any, res: any) {
  const results: any = {
    step: "start",
    time: new Date().toISOString(),
    nodeVersion: process.version,
    cwd: process.cwd(),
    import_server_app: "OK",
    appType: typeof app,
    status: "STATIC_IMPORT_OK"
  };

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(results, null, 2));
}
