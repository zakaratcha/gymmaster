import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const dbDir = mkdtempSync(path.join(tmpdir(), 'gm-session-'));
process.env.GYMMASTER_DB_PATH = path.join(dbDir, 'test.db');

type IssueSession = (trainerId: string, expectedPasswordHash: string) => string | undefined;

type DbApi = {
  migrate(): Promise<void>;
  hashPassword(plain: string): Promise<string>;
  issueSession: IssueSession;
  insertTrainer(id: string, email: string, passwordHash: string): void;
  replacePassword(id: string, passwordHash: string): void;
  setStatus(id: string, status: 'active' | 'blocked'): void;
  sessionCount(trainerId: string): number;
  clearSessions(trainerId: string): void;
};

async function loadDbApi(): Promise<DbApi> {
  const { migrate } = await import('../db/migrate.ts');
  const { getDb } = await import('../db/client.ts');
  const { sessions, trainers } = await import('../db/schema.ts');
  const { hashPassword } = await import('./password.ts');
  const { issueSession } = await import('./sessionStore.ts');

  return {
    migrate,
    hashPassword,
    issueSession,
    insertTrainer(id, email, passwordHash) {
      const now = new Date().toISOString();
      getDb()
        .insert(trainers)
        .values({
          id,
          email,
          password: passwordHash,
          status: 'active',
          admin: 0,
          createdAt: now,
          updatedAt: now
        })
        .run();
    },
    replacePassword(id, passwordHash) {
      getDb()
        .update(trainers)
        .set({ password: passwordHash, updatedAt: new Date().toISOString() })
        .where(eq(trainers.id, id))
        .run();
    },
    setStatus(id, status) {
      getDb().update(trainers).set({ status, updatedAt: new Date().toISOString() }).where(eq(trainers.id, id)).run();
    },
    sessionCount(trainerId) {
      return getDb().select().from(sessions).where(eq(sessions.trainerId, trainerId)).all().length;
    },
    clearSessions(trainerId) {
      getDb().delete(sessions).where(eq(sessions.trainerId, trainerId)).run();
    }
  };
}

describe('issueSession', () => {
  let api: DbApi;
  const trainerId = randomUUID();
  let currentHash = '';

  beforeAll(async () => {
    api = await loadDbApi();
    await api.migrate();
    currentHash = await api.hashPassword('secret-123');
    api.insertTrainer(trainerId, `race-${trainerId}@local`, currentHash);
  });

  afterAll(() => {
    rmSync(dbDir, { recursive: true, force: true });
  });

  it('выдаёт сессию, пока хэш и статус не изменились', () => {
    const token = api.issueSession(trainerId, currentHash);
    expect(token).toEqual(expect.any(String));
    expect(api.sessionCount(trainerId)).toBe(1);
  });

  it('не выдаёт сессию по хэшу, который уже сменён', async () => {
    const staleHash = currentHash;
    currentHash = await api.hashPassword('temp-pass-1');
    api.replacePassword(trainerId, currentHash);
    api.clearSessions(trainerId);

    expect(api.issueSession(trainerId, staleHash)).toBeUndefined();
    expect(api.sessionCount(trainerId)).toBe(0);
  });

  it('не выдаёт сессию заблокированной учётке', () => {
    api.setStatus(trainerId, 'blocked');
    expect(api.issueSession(trainerId, currentHash)).toBeUndefined();
    api.setStatus(trainerId, 'active');
  });
});
