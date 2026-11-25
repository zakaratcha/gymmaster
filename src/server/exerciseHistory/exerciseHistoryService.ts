import { and, asc, desc, eq } from 'drizzle-orm';

import type {
  ExerciseHistoryEntry,
  ExerciseHistoryResponse,
  ExerciseHistorySet
} from '../../services/exerciseHistory/exerciseHistory.models.ts';
import type { AuthContext } from '../auth/authContext.ts';
import { getDb } from '../db/client.ts';
import { clients, exercises, sessionExercises, sessionSets, workoutSessions } from '../db/schema.ts';

type HistorySetRow = {
  readonly sessionId: string;
  readonly completedAt: string | null;
  readonly reps: number;
  readonly weightKg: number;
};

function groupHistoryRows(rows: readonly HistorySetRow[]): ExerciseHistoryEntry[] {
  const entries: { sessionId: string; completedAt: string; sets: ExerciseHistorySet[] }[] = [];

  for (const row of rows) {
    if (row.completedAt === null) {
      continue;
    }

    const set = { reps: row.reps, weightKg: row.weightKg };
    const current = entries.at(-1);
    if (current !== undefined && current.sessionId === row.sessionId) {
      current.sets.push(set);
      continue;
    }

    entries.push({ sessionId: row.sessionId, completedAt: row.completedAt, sets: [set] });
  }

  return entries;
}

export async function getExerciseHistory(
  auth: AuthContext,
  clientId: string,
  exerciseId: string
): Promise<ExerciseHistoryResponse | undefined> {
  const db = getDb();
  const clientRows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.trainerId, auth.trainerId)))
    .limit(1);
  const client = clientRows[0];
  if (client === undefined) {
    return undefined;
  }

  const exerciseRows = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.id, exerciseId), eq(exercises.trainerId, auth.trainerId)))
    .limit(1);
  const exercise = exerciseRows[0];
  if (exercise === undefined) {
    return undefined;
  }

  const rows = await db
    .select({
      sessionId: workoutSessions.id,
      completedAt: workoutSessions.completedAt,
      reps: sessionSets.reps,
      weightKg: sessionSets.weightKg
    })
    .from(workoutSessions)
    .innerJoin(
      sessionExercises,
      and(
        eq(sessionExercises.workoutSessionId, workoutSessions.id),
        eq(sessionExercises.trainerId, auth.trainerId),
        eq(sessionExercises.exerciseId, exerciseId)
      )
    )
    .innerJoin(
      sessionSets,
      and(eq(sessionSets.sessionExerciseId, sessionExercises.id), eq(sessionSets.trainerId, auth.trainerId))
    )
    .where(
      and(
        eq(workoutSessions.trainerId, auth.trainerId),
        eq(workoutSessions.clientId, clientId),
        eq(workoutSessions.status, 'completed')
      )
    )
    .orderBy(
      desc(workoutSessions.completedAt),
      desc(workoutSessions.startedAt),
      desc(workoutSessions.createdAt),
      desc(workoutSessions.id),
      asc(sessionExercises.position),
      asc(sessionSets.position)
    );

  return {
    clientName: client.name,
    exerciseName: exercise.name,
    entries: groupHistoryRows(rows)
  };
}
