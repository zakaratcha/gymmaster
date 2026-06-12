import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

export function getDbPath(): string {
  const configured = process.env.GYMMASTER_DB_PATH;
  if (configured !== undefined && configured.length > 0) {
    return path.resolve(configured);
  }
  return path.join(root, "data", "gymmaster.db");
}

export function ensureDbDirectory(dbPath: string): void {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}
