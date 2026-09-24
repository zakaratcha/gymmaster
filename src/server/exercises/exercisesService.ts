import { randomUUID } from 'node:crypto';
import { and, asc, eq, isNull } from 'drizzle-orm';

import type { ExerciseResponse, ExercisesListResponse } from '../../services/exercises/exercises.models.ts';
import type { AuthContext } from '../auth/authContext.ts';
import { getDb } from '../db/client.ts';
import { exercises } from '../db/schema.ts';
import {
  toPublicExercise,
  type ValidatedCreateExerciseInput,
  type ValidatedUpdateExerciseInput
} from './exerciseMapper.ts';

export async function listExercises(auth: AuthContext, includeArchived: boolean): Promise<ExercisesListResponse> {
  const db = getDb();
  const rows = includeArchived
    ? await db.select().from(exercises).where(eq(exercises.trainerId, auth.trainerId)).orderBy(asc(exercises.name))
    : await db
        .select()
        .from(exercises)
        .where(and(eq(exercises.trainerId, auth.trainerId), isNull(exercises.archivedAt)))
        .orderBy(asc(exercises.name));

  return {
    exercises: rows.map(toPublicExercise)
  };
}

export async function createExercise(
  auth: AuthContext,
  input: ValidatedCreateExerciseInput
): Promise<ExerciseResponse> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  const insertResult = await db.insert(exercises).values({
    id,
    trainerId: auth.trainerId,
    name: input.name,
    notes: input.notes ?? null,
    archivedAt: null,
    createdAt: now,
    updatedAt: now
  });
  if (insertResult.changes === 0) {
    throw new Error('Failed to create exercise');
  }

  const rows = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.id, id), eq(exercises.trainerId, auth.trainerId)))
    .limit(1);

  const row = rows[0];
  if (row === undefined) {
    throw new Error('Failed to create exercise');
  }

  return { exercise: toPublicExercise(row) };
}

export async function getExerciseById(auth: AuthContext, id: string): Promise<ExerciseResponse | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.id, id), eq(exercises.trainerId, auth.trainerId)))
    .limit(1);

  const row = rows[0];
  if (row === undefined) {
    return undefined;
  }

  return { exercise: toPublicExercise(row) };
}

export async function updateExercise(
  auth: AuthContext,
  id: string,
  input: ValidatedUpdateExerciseInput
): Promise<ExerciseResponse | undefined> {
  const existing = await getExerciseById(auth, id);
  if (existing === undefined) {
    return undefined;
  }

  const now = new Date().toISOString();
  const patch: {
    name?: string;
    notes?: string | null;
    archivedAt?: string | null;
    updatedAt: string;
  } = { updatedAt: now };

  if (input.name !== undefined) {
    patch.name = input.name;
  }
  if (input.notes !== undefined) {
    patch.notes = input.notes;
  }
  if (input.archived !== undefined) {
    patch.archivedAt = input.archived ? now : null;
  }

  const db = getDb();
  await db
    .update(exercises)
    .set(patch)
    .where(and(eq(exercises.id, id), eq(exercises.trainerId, auth.trainerId)));

  return await getExerciseById(auth, id);
}
