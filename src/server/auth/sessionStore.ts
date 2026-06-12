import { randomBytes } from "node:crypto";
import type { Response } from "express";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from "../db/client.ts";
import { sessions, trainers, type TrainerRow } from "../db/schema.ts";
import {
  isProduction,
  SESSION_COOKIE,
  sessionMaxAgeMs,
} from "./constants.ts";

function nowIso(): string {
  return new Date().toISOString();
}

function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

function sessionExpiresAt(): string {
  return new Date(Date.now() + sessionMaxAgeMs()).toISOString();
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    maxAge: sessionMaxAgeMs(),
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
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

export async function createSession(
  trainerId: string,
  res: Response,
): Promise<string> {
  const db = getDb();
  await revokeSessionsForTrainer(trainerId);
  await cleanupExpiredSessions();

  const token = newSessionToken();
  const createdAt = nowIso();

  await db.insert(sessions).values({
    id: token,
    trainerId,
    expiresAt: sessionExpiresAt(),
    createdAt,
  });

  setSessionCookie(res, token);
  return token;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.id, token));
}

export async function findTrainerBySessionToken(
  token: string,
): Promise<TrainerRow | undefined> {
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
      updatedAt: trainers.updatedAt,
    })
    .from(sessions)
    .innerJoin(trainers, eq(sessions.trainerId, trainers.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (row === undefined) {
    return undefined;
  }

  if (row.status !== "active") {
    await deleteSessionByToken(token);
    return undefined;
  }

  return row;
}
