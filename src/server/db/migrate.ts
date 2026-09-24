import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';

import { hashPassword } from '../auth/password.ts';
import { seedExercises } from '../exercises/exerciseSeed.ts';
import { getDb, getSqlite } from './client.ts';
import { trainers } from './schema.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const migrationsDir = path.join(root, 'src/server/db/migrations');

const BOOTSTRAP_EMAIL = 'first-admin@local';
/** Dev-only пароль первого админа (ADMIN-BOOT-001). */
const BOOTSTRAP_PASSWORD = 'changeme';

const SECOND_TRAINER_EMAIL = 'second-trainer@local';
/** Dev-only пароль второго тренера для тестов изоляции. */
const SECOND_TRAINER_PASSWORD = 'changeme';

function runSqlMigration(filename: string): void {
  const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');
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
  // eslint-disable-next-line unicorn/no-unused-array-method-return -- Drizzle insert builder, not Map.values()
  await db.insert(trainers).values({
    id: randomUUID(),
    email: BOOTSTRAP_EMAIL,
    password: await hashPassword(BOOTSTRAP_PASSWORD),
    status: 'active',
    admin: 1,
    createdAt: now,
    updatedAt: now
  });
}

async function seedSecondTrainer(): Promise<void> {
  const db = getDb();
  const existing = await db
    .select({ id: trainers.id })
    .from(trainers)
    .where(eq(trainers.email, SECOND_TRAINER_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  const now = new Date().toISOString();
  // eslint-disable-next-line unicorn/no-unused-array-method-return -- Drizzle insert builder, not Map.values()
  await db.insert(trainers).values({
    id: randomUUID(),
    email: SECOND_TRAINER_EMAIL,
    password: await hashPassword(SECOND_TRAINER_PASSWORD),
    status: 'active',
    admin: 0,
    createdAt: now,
    updatedAt: now
  });
}

export async function migrate(): Promise<void> {
  runSqlMigration('0001_init.sql');
  runSqlMigration('0002_clients.sql');
  runSqlMigration('0003_exercises.sql');
  runSqlMigration('0004_planned_workouts.sql');
  await seedBootstrapAdmin();
  await seedSecondTrainer();
  await seedExercises();
}

async function main(): Promise<void> {
  await migrate();
  console.info(`Database migrated: ${getSqlite().name}`);
}

const isDirectRun =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
