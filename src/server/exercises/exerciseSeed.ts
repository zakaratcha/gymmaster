import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';

import { getDb } from '../db/client.ts';
import { exercises, trainers } from '../db/schema.ts';

export const exerciseSeedNames = [
  'Приседание со штангой',
  'Жим лёжа',
  'Становая тяга',
  'Тяга верхнего блока',
  'Тяга штанги в наклоне',
  'Жим гантелей',
  'Выпады',
  'Румынская тяга',
  'Подтягивания',
  'Отжимания',
  'Планка',
  'Сгибание рук со штангой',
  'Разгибание рук на блоке',
  'Подъём на носки'
] as const;

export async function seedExercisesForTrainer(trainerId: string): Promise<void> {
  const db = getDb();
  const existing = await db.select({ name: exercises.name }).from(exercises).where(eq(exercises.trainerId, trainerId));

  if (existing.length > 0) {
    return;
  }

  const now = new Date().toISOString();
  const insertResult = await db.insert(exercises).values(
    exerciseSeedNames.map(name => ({
      id: randomUUID(),
      trainerId,
      name,
      notes: null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now
    }))
  );
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
