import { randomBytes } from 'node:crypto';
import { and, eq, gt, lt } from 'drizzle-orm';
import type { Response } from 'express';

import { getDb, getSqlite } from '../db/client.ts';
import { sessions, type TrainerRow, trainers } from '../db/schema.ts';
import { isProduction, SESSION_COOKIE, sessionMaxAgeMs } from './constants.ts';

function nowIso(): string {
  return new Date().toISOString();
}

function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

function sessionExpiresAt(): string {
  return new Date(Date.now() + sessionMaxAgeMs()).toISOString();
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(),
    maxAge: sessionMaxAgeMs(),
    path: '/'
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(),
    path: '/'
  });
}

export async function cleanupExpiredSessions(): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(lt(sessions.expiresAt, nowIso()));
}

export async function revokeSessionsForTrainer(trainerId: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.trainerId, trainerId));
}

export function issueSession(trainerId: string, expectedPasswordHash: string): string | undefined {
  const db = getDb();

  return getSqlite().transaction(() => {
    const current = db.select().from(trainers).where(eq(trainers.id, trainerId)).get();
    if (current === undefined || current.status !== 'active' || current.password !== expectedPasswordHash) {
      return;
    }

    const token = newSessionToken();
    db.delete(sessions).where(eq(sessions.trainerId, trainerId)).run();
    db.insert(sessions)
      .values({
        id: token,
        trainerId,
        expiresAt: sessionExpiresAt(),
        createdAt: nowIso()
      })
      .run();
    return token;
  })();
}

export async function createSession(trainerId: string, expectedPasswordHash: string, res: Response): Promise<boolean> {
  await cleanupExpiredSessions();
  const token = issueSession(trainerId, expectedPasswordHash);
  if (token === undefined) {
    return false;
  }

  setSessionCookie(res, token);
  return true;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.id, token));
}

export async function findTrainerBySessionToken(token: string): Promise<TrainerRow | undefined> {
  const db = getDb();
  const now = nowIso();

  const rows = await db
    .select({
      id: trainers.id,
      email: trainers.email,
      password: trainers.password,
      status: trainers.status,
      admin: trainers.admin,
      createdAt: trainers.createdAt,
      updatedAt: trainers.updatedAt
    })
    .from(sessions)
    .innerJoin(trainers, eq(sessions.trainerId, trainers.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (row === undefined) {
    return undefined;
  }

  if (row.status !== 'active') {
    await deleteSessionByToken(token);
    return undefined;
  }

  return row;
}
