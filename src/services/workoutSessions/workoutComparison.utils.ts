import type { PlannedWorkout } from '../plans/plans.models.ts';
import { formatSetsText } from '../util/format.utils.ts';
import type { WorkoutComparison, WorkoutComparisonRow, WorkoutComparisonTotals } from './workoutComparison.models.ts';
import type { WorkoutSession, WorkoutSessionExercise } from './workoutSessions.models.ts';

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

function isSameUnusedExercise(
  factExercise: WorkoutSessionExercise,
  index: number,
  usedIndexes: ReadonlySet<number>,
  planExercise: PlannedWorkout['exercises'][number]
): boolean {
  return !usedIndexes.has(index) && factExercise.exerciseId === planExercise.exerciseId;
}

function findExactFactExerciseIndex(
  factExercises: readonly WorkoutSessionExercise[],
  usedIndexes: ReadonlySet<number>,
  planExercise: PlannedWorkout['exercises'][number]
): number {
  for (const [index, factExercise] of factExercises.entries()) {
    if (!isSameUnusedExercise(factExercise, index, usedIndexes, planExercise)) {
      continue;
    }

    if (areSetsEqual(planExercise.sets, factExercise.sets)) {
      return index;
    }
  }

  return -1;
}

function findFirstUnusedFactExerciseIndex(
  factExercises: readonly WorkoutSessionExercise[],
  usedIndexes: ReadonlySet<number>,
  planExercise: PlannedWorkout['exercises'][number]
): number {
  for (const [index, factExercise] of factExercises.entries()) {
    if (isSameUnusedExercise(factExercise, index, usedIndexes, planExercise)) {
      return index;
    }
  }

  return -1;
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
  if (plan === null) {
    return {
      rows: [],
      planTotals: { exerciseCount: 0, setCount: 0, volumeKg: 0 },
      factTotals: { exerciseCount: 0, setCount: 0, volumeKg: 0 }
    };
  }

  const factExercises = session.exercises;
  const usedFactIndexes = new Set<number>();
  const factIndexByPlanIndex = plan.exercises.map(() => -1);

  for (const [planIndex, planExercise] of plan.exercises.entries()) {
    const factIndex = findExactFactExerciseIndex(factExercises, usedFactIndexes, planExercise);
    if (factIndex === -1) {
      continue;
    }

    usedFactIndexes.add(factIndex);
    factIndexByPlanIndex[planIndex] = factIndex;
  }

  const rows: WorkoutComparisonRow[] = [];

  for (const [planIndex, planExercise] of plan.exercises.entries()) {
    let factIndex = factIndexByPlanIndex[planIndex] ?? -1;
    if (factIndex === -1) {
      factIndex = findFirstUnusedFactExerciseIndex(factExercises, usedFactIndexes, planExercise);
      if (factIndex !== -1) {
        usedFactIndexes.add(factIndex);
      }
    }

    if (factIndex === -1) {
      rows.push(buildPlanRow(planExercise));
      continue;
    }

    rows.push(buildPlanRow(planExercise, factExercises[factIndex]));
  }

  factExercises.forEach((factExercise, index) => {
    if (!usedFactIndexes.has(index)) {
      rows.push(buildExtraRow(factExercise));
    }
  });

  return {
    rows,
    planTotals: calculateTotals(plan.exercises),
    factTotals: calculateTotals(factExercises)
  };
}
