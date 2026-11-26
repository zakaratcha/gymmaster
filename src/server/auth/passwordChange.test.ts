import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const dbDir = mkdtempSync(path.join(tmpdir(), 'gm-password-change-'));
process.env.GYMMASTER_DB_PATH = path.join(dbDir, 'test.db');

type ReplacePasswordAndIssueSession = (
  trainerId: string,
  expectedHash: string,
  newHash: string
) => { ok: true; token: string } | { ok: false; reason: 'stale' | 'not-issued' };

type DbApi = {
  migrate(): Promise<void>;
  hashPassword(plain: string): Promise<string>;
  issueSession(trainerId: string, expectedPasswordHash: string): string | undefined;
  replacePasswordAndIssueSession: ReplacePasswordAndIssueSession;
  insertTrainer(id: string, email: string, passwordHash: string): void;
  replacePassword(id: string, passwordHash: string): void;
  setStatus(id: string, status: 'active' | 'blocked'): void;
  readPasswordHash(id: string): string | undefined;
  sessionIds(trainerId: string): readonly string[];
};

async function loadDbApi(): Promise<DbApi> {
  const { migrate } = await import('../db/migrate.ts');
  const { getDb } = await import('../db/client.ts');
  const { sessions, trainers } = await import('../db/schema.ts');
  const { hashPassword } = await import('./password.ts');
  const { issueSession, replacePasswordAndIssueSession } = await import('./sessionStore.ts');

  return {
    migrate,
    hashPassword,
    issueSession,
    replacePasswordAndIssueSession,
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
    readPasswordHash(id) {
      return getDb().select().from(trainers).where(eq(trainers.id, id)).get()?.password;
    },
    sessionIds(trainerId) {
      return getDb()
        .select()
        .from(sessions)
        .where(eq(sessions.trainerId, trainerId))
        .all()
        .map(session => session.id);
    }
  };
}

describe('replacePasswordAndIssueSession', () => {
  let api: DbApi;
  let trainerId = '';
  let currentHash = '';
  let newHash = '';
  let sessionToken = '';

  beforeAll(async () => {
    api = await loadDbApi();
    await api.migrate();
    newHash = await api.hashPassword('new-secret-1');
  });

  beforeEach(async () => {
    trainerId = randomUUID();
    currentHash = await api.hashPassword('secret-123');
    api.insertTrainer(trainerId, `change-${trainerId}@local`, currentHash);
    sessionToken = api.issueSession(trainerId, currentHash) ?? '';
    expect(sessionToken).not.toBe('');
  });

  afterAll(() => {
    rmSync(dbDir, { recursive: true, force: true });
  });

  it('не меняет хэш и сессии, если ожидаемый хэш устарел', async () => {
    const staleHash = currentHash;
    currentHash = await api.hashPassword('temp-pass-1');
    api.replacePassword(trainerId, currentHash);

    expect(api.replacePasswordAndIssueSession(trainerId, staleHash, newHash)).toEqual({ ok: false, reason: 'stale' });
    expect(api.readPasswordHash(trainerId)).toBe(currentHash);
    expect(api.sessionIds(trainerId)).toEqual([sessionToken]);
  });

  it('не меняет хэш и сессии учётки, заблокированной к моменту выдачи', () => {
    api.setStatus(trainerId, 'blocked');

    expect(api.replacePasswordAndIssueSession(trainerId, currentHash, newHash)).toEqual({
      ok: false,
      reason: 'not-issued'
    });
    expect(api.readPasswordHash(trainerId)).toBe(currentHash);
    expect(api.sessionIds(trainerId)).toEqual([sessionToken]);
  });
});
