import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';

import { exerciseSeedNames } from '../../services/exercises/exerciseSeed.models.ts';
import { getDb } from '../db/client.ts';
import { exercises, trainers } from '../db/schema.ts';

export type ExerciseSeedRow = {
  readonly id: string;
  readonly trainerId: string;
  readonly name: string;
  readonly notes: null;
  readonly archivedAt: null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export function buildExerciseSeedRows(trainerId: string, now: string): ExerciseSeedRow[] {
  return exerciseSeedNames.map(name => ({
    id: randomUUID(),
    trainerId,
    name,
    notes: null,
    archivedAt: null,
    createdAt: now,
    updatedAt: now
  }));
}

export async function seedExercisesForTrainer(trainerId: string): Promise<void> {
  const db = getDb();
  const existing = await db.select({ name: exercises.name }).from(exercises).where(eq(exercises.trainerId, trainerId));

  if (existing.length > 0) {
    return;
  }

  const now = new Date().toISOString();
  const insertResult = await db.insert(exercises).values(buildExerciseSeedRows(trainerId, now));
  if (insertResult.changes === 0) {
    throw new Error('Failed to seed exercises');
  }
}

export async function seedExercises(): Promise<void> {
  const db = getDb();
  const trainerRows = await db.select({ id: trainers.id }).from(trainers);

  for (const trainer of trainerRows) {
    await seedExercisesForTrainer(trainer.id);
  }
}

export { exerciseSeedNames } from '../../services/exercises/exerciseSeed.models.ts';
