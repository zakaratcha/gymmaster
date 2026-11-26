import { randomUUID } from 'node:crypto';
import { asc, eq, ne } from 'drizzle-orm';

import type { AdminTrainer, AdminTrainersResponse } from '../../services/trainers/trainers.models.ts';
import type { AuthContext } from '../auth/authContext.ts';
import { hashPassword } from '../auth/password.ts';
import { getDb, getSqlite } from '../db/client.ts';
import { exercises, sessions, type TrainerRow, trainers } from '../db/schema.ts';
import { buildExerciseSeedRows } from '../exercises/exerciseSeed.ts';
import {
  toAdminTrainer,
  type ValidatedCreateTrainerInput,
  type ValidatedResetTrainerPasswordInput,
  type ValidatedUpdateTrainerStatusInput
} from './trainerMapper.ts';

export const TRAINER_EMAIL_CONFLICT_ERROR = 'Учётка с таким email уже существует';
export const SELF_TRAINER_ERROR = 'Нельзя изменить собственную учётку';
const NOT_FOUND_ERROR = 'not_found';

export type CreateTrainerAccountResult =
  | { readonly ok: true; readonly trainer: AdminTrainer }
  | { readonly ok: false; readonly status: 409; readonly error: string };

export type UpdateTrainerAccountResult =
  | { readonly ok: true; readonly trainer: AdminTrainer }
  | { readonly ok: false; readonly status: 400 | 404; readonly error: string };

export type ResetTrainerAccountResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly status: 400 | 404; readonly error: string };

function isEmailUniqueError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code: unknown = Reflect.get(error, 'code');
  return code === 'SQLITE_CONSTRAINT_UNIQUE' && error.message.includes('trainers.email');
}

async function findTrainerRow(id: string): Promise<TrainerRow | undefined> {
  const rows = await getDb().select().from(trainers).where(eq(trainers.id, id)).limit(1);
  return rows[0];
}

function rejectOwnAccount(auth: AuthContext, id: string): UpdateTrainerAccountResult | undefined {
  if (id !== auth.trainerId) {
    return undefined;
  }

  return { ok: false, status: 400, error: SELF_TRAINER_ERROR };
}

export async function listOtherTrainers(auth: AuthContext): Promise<AdminTrainersResponse> {
  const rows = await getDb()
    .select()
    .from(trainers)
    .where(ne(trainers.id, auth.trainerId))
    .orderBy(asc(trainers.email), asc(trainers.id));

  return { trainers: rows.map(row => toAdminTrainer(row)) };
}

export async function createTrainerAccount(input: ValidatedCreateTrainerInput): Promise<CreateTrainerAccountResult> {
  const db = getDb();
  const existing = await db.select({ id: trainers.id }).from(trainers).where(eq(trainers.email, input.email)).limit(1);
  if (existing.length > 0) {
    return { ok: false, status: 409, error: TRAINER_EMAIL_CONFLICT_ERROR };
  }

  const passwordHash = await hashPassword(input.password);
  const id = randomUUID();
  const now = new Date().toISOString();

  try {
    getSqlite().transaction(() => {
      const trainerInsert = db
        .insert(trainers)
        .values({
          id,
          email: input.email,
          password: passwordHash,
          status: 'active',
          admin: 0,
          createdAt: now,
          updatedAt: now
        })
        .run();
      if (trainerInsert.changes === 0) {
        throw new Error('Failed to create trainer');
      }

      const seedInsert = db.insert(exercises).values(buildExerciseSeedRows(id, now)).run();
      if (seedInsert.changes === 0) {
        throw new Error('Failed to seed exercises');
      }
    })();
  } catch (error) {
    if (isEmailUniqueError(error)) {
      return { ok: false, status: 409, error: TRAINER_EMAIL_CONFLICT_ERROR };
    }

    throw error;
  }

  return { ok: true, trainer: { id, email: input.email, status: 'active' } };
}

export async function updateTrainerAccountStatus(
  auth: AuthContext,
  id: string,
  input: ValidatedUpdateTrainerStatusInput
): Promise<UpdateTrainerAccountResult> {
  const ownAccount = rejectOwnAccount(auth, id);
  if (ownAccount !== undefined) {
    return ownAccount;
  }

  const row = await findTrainerRow(id);
  if (row === undefined) {
    return { ok: false, status: 404, error: NOT_FOUND_ERROR };
  }

  const db = getDb();
  const now = new Date().toISOString();
  getSqlite().transaction(() => {
    db.update(trainers).set({ status: input.status, updatedAt: now }).where(eq(trainers.id, id)).run();
    if (input.status === 'blocked') {
      db.delete(sessions).where(eq(sessions.trainerId, id)).run();
    }
  })();

  return { ok: true, trainer: { id: row.id, email: row.email, status: input.status } };
}

export async function resetTrainerAccountPassword(
  auth: AuthContext,
  id: string,
  input: ValidatedResetTrainerPasswordInput
): Promise<ResetTrainerAccountResult> {
  if (id === auth.trainerId) {
    return { ok: false, status: 400, error: SELF_TRAINER_ERROR };
  }

  const row = await findTrainerRow(id);
  if (row === undefined) {
    return { ok: false, status: 404, error: NOT_FOUND_ERROR };
  }

  const passwordHash = await hashPassword(input.password);
  const db = getDb();
  const now = new Date().toISOString();
  getSqlite().transaction(() => {
    db.update(trainers).set({ password: passwordHash, updatedAt: now }).where(eq(trainers.id, id)).run();
    db.delete(sessions).where(eq(sessions.trainerId, id)).run();
  })();

  return { ok: true };
}
