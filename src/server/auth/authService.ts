import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';

import type { CurrentTrainerResponse } from '../../services/auth/auth.models.ts';
import type { Trainer } from '../../services/trainers/trainers.models.ts';
import { getDb } from '../db/client.ts';
import { type TrainerRow, trainers } from '../db/schema.ts';
import { isValidEmail, normalizeEmail, toPublicTrainer, trainerRoles } from '../trainers/trainerMapper.ts';
import type { AuthContext } from './authContext.ts';
import { SESSION_COOKIE } from './constants.ts';
import { verifyPassword } from './password.ts';
import { cleanupExpiredSessions, clearSessionCookie, createSession, deleteSessionByToken } from './sessionStore.ts';

import './authContext.ts';

export type LoginResult =
  | { readonly ok: true; readonly trainer: Trainer }
  | { readonly ok: false; readonly error: 'invalid_credentials' | 'validation_error' };

export async function login(emailRaw: string, password: string, res: Response): Promise<LoginResult> {
  const email = normalizeEmail(emailRaw);

  if (!isValidEmail(email) || password.length === 0) {
    return { ok: false, error: 'validation_error' };
  }

  await cleanupExpiredSessions();

  const db = getDb();
  const rows = await db.select().from(trainers).where(eq(trainers.email, email)).limit(1);

  const row = rows[0];
  if (row === undefined || row.status !== 'active') {
    return { ok: false, error: 'invalid_credentials' };
  }

  const passwordOk = await verifyPassword(password, row.password);
  if (!passwordOk) {
    return { ok: false, error: 'invalid_credentials' };
  }

  await createSession(row.id, res);
  return { ok: true, trainer: toPublicTrainer(row) };
}

export async function logout(sessionToken: string | undefined, res: Response): Promise<void> {
  if (sessionToken !== undefined) {
    await deleteSessionByToken(sessionToken);
  }
  clearSessionCookie(res);
}

export function getCurrentTrainer(auth: AuthContext): CurrentTrainerResponse {
  return {
    trainer: {
      id: auth.trainerId,
      email: auth.email,
      status: auth.status,
      roles: auth.roles
    }
  };
}

export function authContextFromTrainerRow(row: TrainerRow): AuthContext {
  return {
    trainerId: row.id,
    email: row.email,
    status: row.status,
    roles: trainerRoles(row)
  };
}

export function readSessionToken(req: Request): string | undefined {
  for (const [name, value] of Object.entries(req.cookies)) {
    if (name === SESSION_COOKIE && typeof value === 'string') {
      return value;
    }
  }

  return undefined;
}
