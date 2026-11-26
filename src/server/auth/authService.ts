import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';

import type { AuthResult, CurrentTrainerResponse } from '../../services/auth/auth.models.ts';
import { getDb } from '../db/client.ts';
import { type TrainerRow, trainers } from '../db/schema.ts';
import {
  isValidEmail,
  normalizeEmail,
  toPublicTrainer,
  trainerRoles,
  type ValidatedChangeOwnPasswordInput
} from '../trainers/trainerMapper.ts';
import type { AuthContext } from './authContext.ts';
import { SESSION_COOKIE } from './constants.ts';
import { hashPassword, verifyPassword } from './password.ts';
import {
  cleanupExpiredSessions,
  clearSessionCookie,
  createSession,
  deleteSessionByToken,
  replacePasswordAndIssueSession,
  setSessionCookie
} from './sessionStore.ts';

import './authContext.ts';

export async function login(emailRaw: string, password: string, res: Response): Promise<AuthResult> {
  const email = normalizeEmail(emailRaw);

  if (!isValidEmail(email) || password.length === 0) {
    return { ok: false, error: 'Проверьте введённые данные' };
  }

  await cleanupExpiredSessions();

  const db = getDb();
  const rows = await db.select().from(trainers).where(eq(trainers.email, email)).limit(1);

  const row = rows[0];
  if (row === undefined || row.status !== 'active') {
    return { ok: false, error: 'Неверный логин или пароль' };
  }

  const passwordHash = row.password;
  const passwordOk = await verifyPassword(password, passwordHash);
  if (!passwordOk) {
    return { ok: false, error: 'Неверный логин или пароль' };
  }

  const issued = await createSession(row.id, passwordHash, res);
  if (!issued) {
    return { ok: false, error: 'Неверный логин или пароль' };
  }

  return { ok: true, trainer: toPublicTrainer(row) };
}

const WRONG_CURRENT_PASSWORD_ERROR = 'Неверный текущий пароль';

export type ChangeOwnPasswordResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly status: 400; readonly error: string }
  | { readonly ok: false; readonly status: 403 };

export async function changeOwnPassword(
  auth: AuthContext,
  input: ValidatedChangeOwnPasswordInput,
  res: Response
): Promise<ChangeOwnPasswordResult> {
  const rows = await getDb().select().from(trainers).where(eq(trainers.id, auth.trainerId)).limit(1);
  const row = rows[0];
  if (row === undefined) {
    return { ok: false, status: 403 };
  }

  const passwordOk = await verifyPassword(input.currentPassword, row.password);
  if (!passwordOk) {
    return { ok: false, status: 400, error: WRONG_CURRENT_PASSWORD_ERROR };
  }

  const newHash = await hashPassword(input.newPassword);
  const replaced = replacePasswordAndIssueSession(row.id, row.password, newHash);
  if (!replaced.ok) {
    return replaced.reason === 'stale'
      ? { ok: false, status: 400, error: WRONG_CURRENT_PASSWORD_ERROR }
      : { ok: false, status: 403 };
  }

  setSessionCookie(res, replaced.token);
  return { ok: true };
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
