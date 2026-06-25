// Static import test - catches module import errors
let importResult: any = { status: "pending" };

try {
  const { app } = await import("../server/app");
  importResult = { status: "OK", appType: typeof app };
} catch (e: any) {
  importResult = { 
    status: "FAIL", 
    error: e.message,
    stack: e.stack?.split('\n').slice(0, 15)
  };
}

export default async function handler(req: any, res: any) {
  const results: any = {
    step: "start",
    time: new Date().toISOString(),
    nodeVersion: process.version,
    cwd: process.cwd(),
    importResult,
  };

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(results, null, 2));
}
