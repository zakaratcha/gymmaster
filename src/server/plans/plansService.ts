import { randomUUID } from 'node:crypto';
import { and, asc, eq, gte, inArray } from 'drizzle-orm';

import type { PlannedSet, PlannedWorkout, PlanResponse, PlansListResponse } from '../../services/plans/plans.models.ts';
import type { AuthContext } from '../auth/authContext.ts';
import { getDb, getSqlite } from '../db/client.ts';
import type { PlannedExerciseRow, PlannedSetRow, PlannedWorkoutRow } from '../db/schema.ts';
import { clients, exercises, plannedExercises, plannedSets, plannedWorkouts } from '../db/schema.ts';
import {
  type ValidatedCreatePlanInput,
  type ValidatedPlannedExerciseInput,
  type ValidatedUpdatePlanInput
} from './plansMapper.ts';

export class PlanInputError extends Error {}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toPublicPlan(
  row: PlannedWorkoutRow,
  plannedExerciseRows: readonly PlannedExerciseRow[],
  plannedSetRows: readonly PlannedSetRow[],
  exerciseNames: ReadonlyMap<string, string>
): PlannedWorkout {
  const setsByExercise = new Map<string, PlannedSet[]>();
  for (const setRow of plannedSetRows) {
    const sets = setsByExercise.get(setRow.plannedExerciseId) ?? [];
    sets.push({ reps: setRow.reps, weightKg: setRow.weightKg });
    setsByExercise.set(setRow.plannedExerciseId, sets);
  }

  return {
    id: row.id,
    clientId: row.clientId,
    plannedDate: row.plannedDate,
    splitTag: row.splitTag,
    exercises: plannedExerciseRows.map(plannedExerciseRow => {
      const exerciseName = exerciseNames.get(plannedExerciseRow.exerciseId);
      if (exerciseName === undefined) {
        throw new Error('Failed to load planned exercise');
      }

      return {
        exerciseId: plannedExerciseRow.exerciseId,
        exerciseName,
        sets: setsByExercise.get(plannedExerciseRow.id) ?? []
      };
    })
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

async function getPlanRow(auth: AuthContext, clientId: string, planId: string): Promise<PlannedWorkoutRow | undefined> {
  const rows = await getDb()
    .select()
    .from(plannedWorkouts)
    .where(
      and(
        eq(plannedWorkouts.id, planId),
        eq(plannedWorkouts.clientId, clientId),
        eq(plannedWorkouts.trainerId, auth.trainerId)
      )
    )
    .limit(1);

  return rows[0];
}

async function loadPlan(auth: AuthContext, planRow: PlannedWorkoutRow): Promise<PlannedWorkout> {
  const db = getDb();
  const plannedExerciseRows = await db
    .select()
    .from(plannedExercises)
    .where(and(eq(plannedExercises.trainerId, auth.trainerId), eq(plannedExercises.plannedWorkoutId, planRow.id)))
    .orderBy(asc(plannedExercises.position));

  const plannedExerciseIds = plannedExerciseRows.map(row => row.id);
  const plannedSetRows =
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
  const exerciseRows =
    exerciseIds.length === 0
      ? []
      : await db
          .select()
          .from(exercises)
          .where(and(eq(exercises.trainerId, auth.trainerId), inArray(exercises.id, exerciseIds)));

  const exerciseNames = new Map(exerciseRows.map(row => [row.id, row.name]));
  return toPublicPlan(planRow, plannedExerciseRows, plannedSetRows, exerciseNames);
}

async function assertExercisesAvailable(
  auth: AuthContext,
  inputs: readonly ValidatedPlannedExerciseInput[],
  existingExerciseIds: ReadonlySet<string>
): Promise<void> {
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
      throw new PlanInputError('Упражнение недоступно');
    }
  }
}

export async function listPlans(auth: AuthContext, clientId: string): Promise<PlansListResponse | undefined> {
  if (!(await hasClient(auth, clientId))) {
    return undefined;
  }

  const rows = await getDb()
    .select()
    .from(plannedWorkouts)
    .where(
      and(
        eq(plannedWorkouts.trainerId, auth.trainerId),
        eq(plannedWorkouts.clientId, clientId),
        gte(plannedWorkouts.plannedDate, formatLocalDate(new Date()))
      )
    )
    .orderBy(asc(plannedWorkouts.plannedDate), asc(plannedWorkouts.createdAt), asc(plannedWorkouts.id));

  return { plans: await Promise.all(rows.map(row => loadPlan(auth, row))) };
}

export async function getPlanById(
  auth: AuthContext,
  clientId: string,
  planId: string
): Promise<PlanResponse | undefined> {
  const row = await getPlanRow(auth, clientId, planId);
  if (row === undefined) {
    return undefined;
  }

  return { plan: await loadPlan(auth, row) };
}

export async function createPlan(
  auth: AuthContext,
  clientId: string,
  input: ValidatedCreatePlanInput
): Promise<PlanResponse | undefined> {
  if (!(await hasClient(auth, clientId))) {
    return undefined;
  }

  await assertExercisesAvailable(auth, input.exercises, new Set());
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  getSqlite().transaction(() => {
    db.insert(plannedWorkouts)
      .values({
        id,
        trainerId: auth.trainerId,
        clientId,
        plannedDate: input.plannedDate,
        splitTag: input.splitTag,
        createdAt: now,
        updatedAt: now
      })
      .run();

    input.exercises.forEach((exercise, exercisePosition) => {
      const plannedExerciseId = randomUUID();
      db.insert(plannedExercises)
        .values({
          id: plannedExerciseId,
          trainerId: auth.trainerId,
          plannedWorkoutId: id,
          exerciseId: exercise.exerciseId,
          position: exercisePosition,
          createdAt: now,
          updatedAt: now
        })
        .run();

      exercise.sets.forEach((set, setPosition) => {
        db.insert(plannedSets)
          .values({
            id: randomUUID(),
            trainerId: auth.trainerId,
            plannedExerciseId,
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

  const row = await getPlanRow(auth, clientId, id);
  if (row === undefined) {
    throw new Error('Failed to create plan');
  }

  return { plan: await loadPlan(auth, row) };
}

export async function updatePlan(
  auth: AuthContext,
  clientId: string,
  planId: string,
  input: ValidatedUpdatePlanInput
): Promise<PlanResponse | undefined> {
  const existingRow = await getPlanRow(auth, clientId, planId);
  if (existingRow === undefined) {
    return undefined;
  }

  if (input.exercises !== undefined) {
    const plan = await getPlanById(auth, clientId, planId);
    if (plan === undefined) {
      return undefined;
    }

    const existingCatalogIds = new Set(plan.plan.exercises.map(exercise => exercise.exerciseId));
    await assertExercisesAvailable(auth, input.exercises, existingCatalogIds);
  }

  const db = getDb();
  const patch: {
    plannedDate?: string;
    splitTag?: string;
    updatedAt: string;
  } = { updatedAt: new Date().toISOString() };
  if (input.plannedDate !== undefined) {
    patch.plannedDate = input.plannedDate;
  }
  if (input.splitTag !== undefined) {
    patch.splitTag = input.splitTag;
  }

  getSqlite().transaction(() => {
    db.update(plannedWorkouts)
      .set(patch)
      .where(
        and(
          eq(plannedWorkouts.id, planId),
          eq(plannedWorkouts.clientId, clientId),
          eq(plannedWorkouts.trainerId, auth.trainerId)
        )
      )
      .run();

    if (input.exercises !== undefined) {
      db.delete(plannedExercises)
        .where(and(eq(plannedExercises.trainerId, auth.trainerId), eq(plannedExercises.plannedWorkoutId, planId)))
        .run();

      const now = patch.updatedAt;
      input.exercises.forEach((exercise, exercisePosition) => {
        const plannedExerciseId = randomUUID();
        db.insert(plannedExercises)
          .values({
            id: plannedExerciseId,
            trainerId: auth.trainerId,
            plannedWorkoutId: planId,
            exerciseId: exercise.exerciseId,
            position: exercisePosition,
            createdAt: now,
            updatedAt: now
          })
          .run();

        exercise.sets.forEach((set, setPosition) => {
          db.insert(plannedSets)
            .values({
              id: randomUUID(),
              trainerId: auth.trainerId,
              plannedExerciseId,
              position: setPosition,
              reps: set.reps,
              weightKg: set.weightKg,
              createdAt: now,
              updatedAt: now
            })
            .run();
        });
      });
    }
  })();

  const updatedRow = await getPlanRow(auth, clientId, planId);
  if (updatedRow === undefined) {
    return undefined;
  }

  return { plan: await loadPlan(auth, updatedRow) };
}

export function deletePlan(auth: AuthContext, clientId: string, planId: string): boolean {
  const result = getDb()
    .delete(plannedWorkouts)
    .where(
      and(
        eq(plannedWorkouts.id, planId),
        eq(plannedWorkouts.clientId, clientId),
        eq(plannedWorkouts.trainerId, auth.trainerId)
      )
    )
    .run();

  return result.changes > 0;
}
