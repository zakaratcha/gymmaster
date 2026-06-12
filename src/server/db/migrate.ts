import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword } from "../auth/password.ts";
import { getDb, getSqlite } from "./client.ts";
import { trainers } from "./schema.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const migrationsDir = path.join(root, "src/server/db/migrations");

const BOOTSTRAP_EMAIL = "first-admin@local";
/** Dev-only пароль первого админа (ADMIN-BOOT-001). */
const BOOTSTRAP_PASSWORD = "changeme";

function runSqlMigration(filename: string): void {
  const sql = fs.readFileSync(path.join(migrationsDir, filename), "utf-8");
  getSqlite().exec(sql);
}

async function seedBootstrapAdmin(): Promise<void> {
  const db = getDb();
  const existing = await db
    .select({ id: trainers.id })
    .from(trainers)
    .where(eq(trainers.email, BOOTSTRAP_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  const now = new Date().toISOString();
  await db.insert(trainers).values({
    id: randomUUID(),
    email: BOOTSTRAP_EMAIL,
    password: await hashPassword(BOOTSTRAP_PASSWORD),
    status: "active",
    admin: 1,
    createdAt: now,
    updatedAt: now,
  });
}

export async function migrate(): Promise<void> {
  runSqlMigration("0001_init.sql");
  await seedBootstrapAdmin();
}

async function main(): Promise<void> {
  await migrate();
  console.info(`Database migrated: ${getSqlite().name}`);
}

const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  void main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
