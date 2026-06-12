import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import { migrate } from "./db/migrate.ts";
import { apiRouter } from "./routes.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, "../client");

await migrate();

const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParser());
app.use("/api", apiRouter);
app.use(express.static(clientDir, { index: false }));
app.use((_req, res) => {
  void res.sendFile(path.join(clientDir, "index.html"));
});

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
if (!Number.isInteger(port) || port < 1) {
  throw new Error("Invalid PORT environment variable.");
}

app.listen(port);
