import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { ensureDbDirectory, getDbPath } from './config.ts';
import * as schema from './schema.ts';

let sqlite: Database.Database | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getSqlite(): Database.Database {
  if (sqlite === undefined) {
    const dbPath = getDbPath();
    ensureDbDirectory(dbPath);
    sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
  }
  return sqlite;
}

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (db === undefined) {
    db = drizzle(getSqlite(), { schema });
  }
  return db;
}
