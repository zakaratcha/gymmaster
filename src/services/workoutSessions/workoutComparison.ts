import type { PlannedWorkout } from '../plans/plans.models';
import { formatSetsText } from '../util/format/format';
import type { WorkoutSession, WorkoutSessionExercise } from './workoutSessions.models';

export type WorkoutComparisonStatus = 'matched' | 'deviated' | 'not_done' | 'extra';

export type WorkoutComparisonRow = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly planText: string;
  readonly factText: string;
  readonly status: WorkoutComparisonStatus;
  readonly planVolumeKg: number;
  readonly factVolumeKg: number;
};

export type WorkoutComparisonTotals = {
  readonly exerciseCount: number;
  readonly setCount: number;
  readonly volumeKg: number;
};

export type WorkoutComparison = {
  readonly rows: readonly WorkoutComparisonRow[];
  readonly planTotals: WorkoutComparisonTotals;
  readonly factTotals: WorkoutComparisonTotals;
};

type ComparableSet = {
  readonly reps: number;
  readonly weightKg: number;
};

type ComparableExercise = {
  readonly sets: readonly ComparableSet[];
};

const EMPTY_VALUE = '—';

export function calculateVolumeKg(sets: readonly ComparableSet[]): number {
  return sets.reduce((total, set) => total + set.reps * set.weightKg, 0);
}

function areSetsEqual(planSets: readonly ComparableSet[], factSets: readonly ComparableSet[]): boolean {
  if (planSets.length !== factSets.length) {
    return false;
  }

  return planSets.every((planSet, index) => {
    const factSet = factSets[index];
    return factSet !== undefined && factSet.reps === planSet.reps && factSet.weightKg === planSet.weightKg;
  });
}

function calculateTotals(exercises: readonly ComparableExercise[]): WorkoutComparisonTotals {
  return {
    exerciseCount: exercises.length,
    setCount: exercises.reduce((total, exercise) => total + exercise.sets.length, 0),
    volumeKg: exercises.reduce((total, exercise) => total + calculateVolumeKg(exercise.sets), 0)
  };
}

function findFactExerciseIndex(
  factExercises: readonly WorkoutSessionExercise[],
  usedIndexes: ReadonlySet<number>,
  exerciseId: string
): number {
  return factExercises.findIndex((exercise, index) => exercise.exerciseId === exerciseId && !usedIndexes.has(index));
}

function buildPlanRow(
  planExercise: PlannedWorkout['exercises'][number],
  factExercise?: WorkoutSessionExercise
): WorkoutComparisonRow {
  const planVolumeKg = calculateVolumeKg(planExercise.sets);

  if (factExercise === undefined) {
    return {
      exerciseId: planExercise.exerciseId,
      exerciseName: planExercise.exerciseName,
      planText: formatSetsText(planExercise.sets),
      factText: EMPTY_VALUE,
      status: 'not_done',
      planVolumeKg,
      factVolumeKg: 0
    };
  }

  return {
    exerciseId: planExercise.exerciseId,
    exerciseName: factExercise.exerciseName,
    planText: formatSetsText(planExercise.sets),
    factText: formatSetsText(factExercise.sets),
    status: areSetsEqual(planExercise.sets, factExercise.sets) ? 'matched' : 'deviated',
    planVolumeKg,
    factVolumeKg: calculateVolumeKg(factExercise.sets)
  };
}

function buildExtraRow(factExercise: WorkoutSessionExercise): WorkoutComparisonRow {
  return {
    exerciseId: factExercise.exerciseId,
    exerciseName: factExercise.exerciseName,
    planText: EMPTY_VALUE,
    factText: formatSetsText(factExercise.sets),
    status: 'extra',
    planVolumeKg: 0,
    factVolumeKg: calculateVolumeKg(factExercise.sets)
  };
}

export function buildWorkoutComparison(plan: PlannedWorkout | null, session: WorkoutSession): WorkoutComparison {
  const factExercises = session.exercises;
  const usedFactIndexes = new Set<number>();
  const rows: WorkoutComparisonRow[] = [];

  for (const planExercise of plan?.exercises ?? []) {
    const factIndex = findFactExerciseIndex(factExercises, usedFactIndexes, planExercise.exerciseId);
    if (factIndex === -1) {
      rows.push(buildPlanRow(planExercise));
      continue;
    }

    usedFactIndexes.add(factIndex);
    rows.push(buildPlanRow(planExercise, factExercises[factIndex]));
  }

  factExercises.forEach((factExercise, index) => {
    if (!usedFactIndexes.has(index)) {
      rows.push(buildExtraRow(factExercise));
    }
  });

  return {
    rows,
    planTotals: calculateTotals(plan?.exercises ?? []),
    factTotals: calculateTotals(factExercises)
  };
}
