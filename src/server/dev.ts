import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./routes.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function main(): Promise<void> {
  const app = express();
  app.disable("x-powered-by");
  app.use("/api", apiRouter);

  const vite = await createViteServer({
    configFile: path.join(root, "vite.config.ts"),
    root,
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    if (
      req.method !== "GET" ||
      res.writableEnded ||
      req.accepts("html") === false
    ) {
      next();
      return;
    }
    try {
      const url = req.originalUrl;
      const template = fs.readFileSync(path.join(root, "index.html"), "utf-8");
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).setHeader("Content-Type", "text/html").end(html);
    } catch (err) {
      next(err);
    }
  });

  const port = Number.parseInt(process.env.PORT ?? "5173", 10);
  if (!Number.isInteger(port) || port < 1) {
    throw new Error("Invalid PORT environment variable.");
  }
  app.listen(port, () => {
    console.info(`dev http://127.0.0.1:${port}`);
  });
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
