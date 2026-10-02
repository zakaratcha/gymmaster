import { randomUUID } from 'node:crypto';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import type {
  WorkoutSession,
  WorkoutSessionActiveResponse,
  WorkoutSessionExercise,
  WorkoutSessionLatestCompletedResponse,
  WorkoutSessionResponse,
  WorkoutSessionSet
} from '../../services/workoutSessions/workoutSessions.models.ts';
import type { AuthContext } from '../auth/authContext.ts';
import { getDb, getSqlite } from '../db/client.ts';
import type {
  ExerciseRow,
  PlannedExerciseRow,
  PlannedSetRow,
  PlannedWorkoutRow,
  SessionExerciseRow,
  SessionSetRow,
  WorkoutSessionRow
} from '../db/schema.ts';
import {
  clients,
  exercises,
  plannedExercises,
  plannedSets,
  plannedWorkouts,
  sessionExercises,
  sessionSets,
  workoutSessions
} from '../db/schema.ts';
import {
  type ValidatedCreateWorkoutSessionInput,
  type ValidatedUpdateWorkoutSessionInput
} from './workoutSessionsMapper.ts';

type PlanSnapshot = {
  readonly splitTag: string;
  readonly exercises: readonly {
    readonly exerciseId: string;
    readonly exerciseName: string;
    readonly sets: readonly WorkoutSessionSet[];
  }[];
};

export class WorkoutSessionInputError extends Error {}

export class WorkoutSessionAlreadyInProgressError extends Error {
  constructor() {
    super('workout_session_already_in_progress');
  }
}

export class WorkoutSessionCompletedError extends Error {
  constructor() {
    super('workout_session_completed');
  }
}

function toPublicWorkoutSession(
  row: WorkoutSessionRow,
  sessionExerciseRows: readonly SessionExerciseRow[],
  sessionSetRows: readonly SessionSetRow[],
  exerciseNames: ReadonlyMap<string, string>
): WorkoutSession {
  const setsByExercise = new Map<string, WorkoutSessionSet[]>();
  for (const setRow of sessionSetRows) {
    const sets = setsByExercise.get(setRow.sessionExerciseId) ?? [];
    sets.push({ reps: setRow.reps, weightKg: setRow.weightKg });
    setsByExercise.set(setRow.sessionExerciseId, sets);
  }

  const sessionExercises: WorkoutSessionExercise[] = sessionExerciseRows.map(sessionExerciseRow => {
    const exerciseName = exerciseNames.get(sessionExerciseRow.exerciseId);
    if (exerciseName === undefined) {
      throw new Error('Failed to load session exercise');
    }

    return {
      exerciseId: sessionExerciseRow.exerciseId,
      exerciseName,
      sets: setsByExercise.get(sessionExerciseRow.id) ?? []
    };
  });

  return {
    id: row.id,
    clientId: row.clientId,
    ...(row.plannedWorkoutId === null ? {} : { plannedWorkoutId: row.plannedWorkoutId }),
    splitTag: row.splitTag,
    status: row.status,
    startedAt: row.startedAt,
    ...(row.completedAt === null ? {} : { completedAt: row.completedAt }),
    exercises: sessionExercises
  };
}

async function hasClient(auth: AuthContext, clientId: string): Promise<boolean> {
  const rows = await getDb()
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.trainerId, auth.trainerId)))
    .limit(1);

  return rows.length > 0;
}

async function getWorkoutSessionRow(
  auth: AuthContext,
  clientId: string,
  sessionId: string
): Promise<WorkoutSessionRow | undefined> {
  const rows = await getDb()
    .select()
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.id, sessionId),
        eq(workoutSessions.clientId, clientId),
        eq(workoutSessions.trainerId, auth.trainerId)
      )
    )
    .limit(1);

  return rows[0];
}

async function getWorkoutSessionRowByStatus(
  auth: AuthContext,
  clientId: string,
  status: 'in_progress' | 'completed'
): Promise<WorkoutSessionRow | undefined> {
  const rows = await getDb()
    .select()
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.clientId, clientId),
        eq(workoutSessions.trainerId, auth.trainerId),
        eq(workoutSessions.status, status)
      )
    )
    .orderBy(
      status === 'completed' ? desc(workoutSessions.completedAt) : desc(workoutSessions.startedAt),
      desc(workoutSessions.startedAt),
      desc(workoutSessions.createdAt),
      desc(workoutSessions.id)
    )
    .limit(1);

  return rows[0];
}

async function getPlanRow(
  auth: AuthContext,
  clientId: string,
  plannedWorkoutId: string
): Promise<PlannedWorkoutRow | undefined> {
  const rows = await getDb()
    .select()
    .from(plannedWorkouts)
    .where(
      and(
        eq(plannedWorkouts.id, plannedWorkoutId),
        eq(plannedWorkouts.clientId, clientId),
        eq(plannedWorkouts.trainerId, auth.trainerId)
      )
    )
    .limit(1);

  return rows[0];
}

async function loadPlanSnapshot(auth: AuthContext, planRow: PlannedWorkoutRow): Promise<PlanSnapshot> {
  const db = getDb();
  const plannedExerciseRows = await db
    .select()
    .from(plannedExercises)
    .where(and(eq(plannedExercises.trainerId, auth.trainerId), eq(plannedExercises.plannedWorkoutId, planRow.id)))
    .orderBy(asc(plannedExercises.position));

  const plannedExerciseIds = plannedExerciseRows.map(row => row.id);
  const plannedSetRows: PlannedSetRow[] =
    plannedExerciseIds.length === 0
      ? []
      : await db
          .select()
          .from(plannedSets)
          .where(
            and(eq(plannedSets.trainerId, auth.trainerId), inArray(plannedSets.plannedExerciseId, plannedExerciseIds))
          )
          .orderBy(asc(plannedSets.position));

  const exerciseIds = [...new Set(plannedExerciseRows.map(row => row.exerciseId))];
  const exerciseRows: ExerciseRow[] =
    exerciseIds.length === 0
      ? []
      : await db
          .select()
          .from(exercises)
          .where(and(eq(exercises.trainerId, auth.trainerId), inArray(exercises.id, exerciseIds)));
  const exerciseNames = new Map(exerciseRows.map(row => [row.id, row.name]));
  const setsByExercise = new Map<string, WorkoutSessionSet[]>();
  for (const setRow of plannedSetRows) {
    const sets = setsByExercise.get(setRow.plannedExerciseId) ?? [];
    sets.push({ reps: setRow.reps, weightKg: setRow.weightKg });
    setsByExercise.set(setRow.plannedExerciseId, sets);
  }

  const snapshotExercises = plannedExerciseRows.map((plannedExerciseRow: PlannedExerciseRow) => {
    const exerciseName = exerciseNames.get(plannedExerciseRow.exerciseId);
    if (exerciseName === undefined) {
      throw new Error('Failed to load planned exercise');
    }

    return {
      exerciseId: plannedExerciseRow.exerciseId,
      exerciseName,
      sets: setsByExercise.get(plannedExerciseRow.id) ?? []
    };
  });

  return { splitTag: planRow.splitTag, exercises: snapshotExercises };
}

async function loadWorkoutSession(auth: AuthContext, row: WorkoutSessionRow): Promise<WorkoutSession> {
  const db = getDb();
  const sessionExerciseRows = await db
    .select()
    .from(sessionExercises)
    .where(and(eq(sessionExercises.trainerId, auth.trainerId), eq(sessionExercises.workoutSessionId, row.id)))
    .orderBy(asc(sessionExercises.position));

  const sessionExerciseIds = sessionExerciseRows.map(sessionExerciseRow => sessionExerciseRow.id);
  const sessionSetRows =
    sessionExerciseIds.length === 0
      ? []
      : await db
          .select()
          .from(sessionSets)
          .where(
            and(eq(sessionSets.trainerId, auth.trainerId), inArray(sessionSets.sessionExerciseId, sessionExerciseIds))
          )
          .orderBy(asc(sessionSets.position));

  const exerciseIds = [...new Set(sessionExerciseRows.map(sessionExerciseRow => sessionExerciseRow.exerciseId))];
  const exerciseRows =
    exerciseIds.length === 0
      ? []
      : await db
          .select()
          .from(exercises)
          .where(and(eq(exercises.trainerId, auth.trainerId), inArray(exercises.id, exerciseIds)));
  const exerciseNames = new Map(exerciseRows.map(row => [row.id, row.name]));

  return toPublicWorkoutSession(row, sessionExerciseRows, sessionSetRows, exerciseNames);
}

async function assertExercisesAvailable(
  auth: AuthContext,
  sessionId: string,
  inputs: readonly ValidatedUpdateWorkoutSessionInput['exercises'][number][]
): Promise<void> {
  const existingRows = await getDb()
    .select({ exerciseId: sessionExercises.exerciseId })
    .from(sessionExercises)
    .where(and(eq(sessionExercises.trainerId, auth.trainerId), eq(sessionExercises.workoutSessionId, sessionId)));
  const existingExerciseIds = new Set(existingRows.map(row => row.exerciseId));
  const exerciseIds = [...new Set(inputs.map(input => input.exerciseId))];
  if (exerciseIds.length === 0) {
    return;
  }

  const rows = await getDb()
    .select()
    .from(exercises)
    .where(and(eq(exercises.trainerId, auth.trainerId), inArray(exercises.id, exerciseIds)));
  const exerciseById = new Map(rows.map(row => [row.id, row]));

  for (const input of inputs) {
    const exercise = exerciseById.get(input.exerciseId);
    if (exercise === undefined || (exercise.archivedAt !== null && !existingExerciseIds.has(input.exerciseId))) {
      throw new WorkoutSessionInputError('Упражнение недоступно');
    }
  }
}

function isActiveSessionUniqueError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code: unknown = Reflect.get(error, 'code');
  return (
    code === 'SQLITE_CONSTRAINT_UNIQUE' &&
    (error.message.includes('workout_sessions.trainer_id') ||
      error.message.includes('uq_workout_sessions_trainer_client_active'))
  );
}

export async function getActiveWorkoutSession(
  auth: AuthContext,
  clientId: string
): Promise<WorkoutSessionActiveResponse | undefined> {
  if (!(await hasClient(auth, clientId))) {
    return undefined;
  }

  const row = await getWorkoutSessionRowByStatus(auth, clientId, 'in_progress');
  return { workoutSession: row === undefined ? null : await loadWorkoutSession(auth, row) };
}

export async function getLatestCompletedWorkoutSession(
  auth: AuthContext,
  clientId: string
): Promise<WorkoutSessionLatestCompletedResponse | undefined> {
  if (!(await hasClient(auth, clientId))) {
    return undefined;
  }

  const row = await getWorkoutSessionRowByStatus(auth, clientId, 'completed');
  return { workoutSession: row === undefined ? null : await loadWorkoutSession(auth, row) };
}

export async function getWorkoutSessionById(
  auth: AuthContext,
  clientId: string,
  sessionId: string
): Promise<WorkoutSessionResponse | undefined> {
  const row = await getWorkoutSessionRow(auth, clientId, sessionId);
  if (row === undefined) {
    return undefined;
  }

  return { workoutSession: await loadWorkoutSession(auth, row) };
}

export async function createWorkoutSession(
  auth: AuthContext,
  clientId: string,
  input: ValidatedCreateWorkoutSessionInput
): Promise<WorkoutSessionResponse | undefined> {
  if (!(await hasClient(auth, clientId))) {
    return undefined;
  }

  const planRow = await getPlanRow(auth, clientId, input.plannedWorkoutId);
  if (planRow === undefined) {
    return undefined;
  }

  const planSnapshot = await loadPlanSnapshot(auth, planRow);
  const activeRow = await getWorkoutSessionRowByStatus(auth, clientId, 'in_progress');
  if (activeRow !== undefined) {
    throw new WorkoutSessionAlreadyInProgressError();
  }

  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  try {
    getSqlite().transaction(() => {
      db.insert(workoutSessions)
        .values({
          id,
          trainerId: auth.trainerId,
          clientId,
          plannedWorkoutId: input.plannedWorkoutId,
          splitTag: planSnapshot.splitTag,
          status: 'in_progress',
          startedAt: now,
          completedAt: null,
          createdAt: now,
          updatedAt: now
        })
        .run();

      planSnapshot.exercises.forEach((exercise, exercisePosition) => {
        const sessionExerciseId = randomUUID();
        db.insert(sessionExercises)
          .values({
            id: sessionExerciseId,
            trainerId: auth.trainerId,
            workoutSessionId: id,
            exerciseId: exercise.exerciseId,
            position: exercisePosition,
            createdAt: now,
            updatedAt: now
          })
          .run();

        exercise.sets.forEach((set, setPosition) => {
          db.insert(sessionSets)
            .values({
              id: randomUUID(),
              trainerId: auth.trainerId,
              sessionExerciseId,
              position: setPosition,
              reps: set.reps,
              weightKg: set.weightKg,
              createdAt: now,
              updatedAt: now
            })
            .run();
        });
      });
    })();
  } catch (error) {
    if (isActiveSessionUniqueError(error)) {
      throw new WorkoutSessionAlreadyInProgressError();
    }

    throw error;
  }

  const row = await getWorkoutSessionRow(auth, clientId, id);
  if (row === undefined) {
    throw new Error('Failed to create workout session');
  }

  return { workoutSession: await loadWorkoutSession(auth, row) };
}

export async function updateWorkoutSession(
  auth: AuthContext,
  clientId: string,
  sessionId: string,
  input: ValidatedUpdateWorkoutSessionInput
): Promise<WorkoutSessionResponse | undefined> {
  const existingRow = await getWorkoutSessionRow(auth, clientId, sessionId);
  if (existingRow === undefined) {
    return undefined;
  }

  if (existingRow.status === 'completed') {
    throw new WorkoutSessionCompletedError();
  }

  await assertExercisesAvailable(auth, sessionId, input.exercises);
  const db = getDb();
  const now = new Date().toISOString();

  getSqlite().transaction(() => {
    const currentRow = db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.id, sessionId),
          eq(workoutSessions.clientId, clientId),
          eq(workoutSessions.trainerId, auth.trainerId)
        )
      )
      .get();
    if (currentRow === undefined) {
      throw new Error('Failed to update workout session');
    }

    if (currentRow.status === 'completed') {
      throw new WorkoutSessionCompletedError();
    }

    db.delete(sessionExercises)
      .where(and(eq(sessionExercises.trainerId, auth.trainerId), eq(sessionExercises.workoutSessionId, sessionId)))
      .run();

    input.exercises.forEach((exercise, exercisePosition) => {
      const sessionExerciseId = randomUUID();
      db.insert(sessionExercises)
        .values({
          id: sessionExerciseId,
          trainerId: auth.trainerId,
          workoutSessionId: sessionId,
          exerciseId: exercise.exerciseId,
          position: exercisePosition,
          createdAt: now,
          updatedAt: now
        })
        .run();

      exercise.sets.forEach((set, setPosition) => {
        db.insert(sessionSets)
          .values({
            id: randomUUID(),
            trainerId: auth.trainerId,
            sessionExerciseId,
            position: setPosition,
            reps: set.reps,
            weightKg: set.weightKg,
            createdAt: now,
            updatedAt: now
          })
          .run();
      });
    });

    db.update(workoutSessions)
      .set({ updatedAt: now })
      .where(
        and(
          eq(workoutSessions.id, sessionId),
          eq(workoutSessions.clientId, clientId),
          eq(workoutSessions.trainerId, auth.trainerId)
        )
      )
      .run();
  })();

  const updatedRow = await getWorkoutSessionRow(auth, clientId, sessionId);
  if (updatedRow === undefined) {
    return undefined;
  }

  return { workoutSession: await loadWorkoutSession(auth, updatedRow) };
}

export async function completeWorkoutSession(
  auth: AuthContext,
  clientId: string,
  sessionId: string
): Promise<WorkoutSessionResponse | undefined> {
  const existingRow = await getWorkoutSessionRow(auth, clientId, sessionId);
  if (existingRow === undefined) {
    return undefined;
  }

  if (existingRow.status === 'in_progress') {
    const now = new Date().toISOString();
    getDb()
      .update(workoutSessions)
      .set({ status: 'completed', completedAt: now, updatedAt: now })
      .where(
        and(
          eq(workoutSessions.id, sessionId),
          eq(workoutSessions.clientId, clientId),
          eq(workoutSessions.trainerId, auth.trainerId),
          eq(workoutSessions.status, 'in_progress')
        )
      )
      .run();
  }

  const completedRow = await getWorkoutSessionRow(auth, clientId, sessionId);
  if (completedRow === undefined) {
    return undefined;
  }

  return { workoutSession: await loadWorkoutSession(auth, completedRow) };
}
