import { formatSetsText } from '../util/format.utils.ts';
import type { PreviousWorkoutComparison, PreviousWorkoutComparisonRow } from './previousWorkoutComparison.models.ts';
import { calculateVolumeKg } from './workoutComparison.utils.ts';
import type { WorkoutSession, WorkoutSessionExercise, WorkoutSessionSet } from './workoutSessions.models.ts';

const EMPTY_VALUE = '—';

function areSetsEqual(previousSets: readonly WorkoutSessionSet[], currentSets: readonly WorkoutSessionSet[]): boolean {
  if (previousSets.length !== currentSets.length) {
    return false;
  }

  return previousSets.every((previousSet, index) => {
    const currentSet = currentSets[index];
    return (
      currentSet !== undefined && currentSet.reps === previousSet.reps && currentSet.weightKg === previousSet.weightKg
    );
  });
}

function totalVolumeKg(exercises: readonly WorkoutSessionExercise[]): number {
  let total = 0;
  for (const exercise of exercises) {
    total += calculateVolumeKg(exercise.sets);
  }

  return total;
}

function isSameUnusedExercise(
  previousExercise: WorkoutSessionExercise,
  index: number,
  usedIndexes: ReadonlySet<number>,
  currentExercise: WorkoutSessionExercise
): boolean {
  return !usedIndexes.has(index) && previousExercise.exerciseId === currentExercise.exerciseId;
}

function findExactPreviousIndex(
  previousExercises: readonly WorkoutSessionExercise[],
  usedIndexes: ReadonlySet<number>,
  currentExercise: WorkoutSessionExercise
): number {
  for (const [index, previousExercise] of previousExercises.entries()) {
    if (!isSameUnusedExercise(previousExercise, index, usedIndexes, currentExercise)) {
      continue;
    }

    if (areSetsEqual(previousExercise.sets, currentExercise.sets)) {
      return index;
    }
  }

  return -1;
}

function findFirstUnusedPreviousIndex(
  previousExercises: readonly WorkoutSessionExercise[],
  usedIndexes: ReadonlySet<number>,
  currentExercise: WorkoutSessionExercise
): number {
  for (const [index, previousExercise] of previousExercises.entries()) {
    if (isSameUnusedExercise(previousExercise, index, usedIndexes, currentExercise)) {
      return index;
    }
  }

  return -1;
}

function buildCurrentRow(
  currentExercise: WorkoutSessionExercise,
  previousExercise?: WorkoutSessionExercise
): PreviousWorkoutComparisonRow {
  return {
    exerciseId: currentExercise.exerciseId,
    exerciseName: currentExercise.exerciseName,
    previousText: previousExercise === undefined ? EMPTY_VALUE : formatSetsText(previousExercise.sets),
    currentText: formatSetsText(currentExercise.sets),
    previousVolumeKg: previousExercise === undefined ? 0 : calculateVolumeKg(previousExercise.sets),
    currentVolumeKg: calculateVolumeKg(currentExercise.sets)
  };
}

function buildPreviousOnlyRow(previousExercise: WorkoutSessionExercise): PreviousWorkoutComparisonRow {
  return {
    exerciseId: previousExercise.exerciseId,
    exerciseName: previousExercise.exerciseName,
    previousText: formatSetsText(previousExercise.sets),
    currentText: EMPTY_VALUE,
    previousVolumeKg: calculateVolumeKg(previousExercise.sets),
    currentVolumeKg: 0
  };
}

export function buildPreviousWorkoutComparison(
  previous: WorkoutSession,
  current: WorkoutSession
): PreviousWorkoutComparison {
  const previousExercises = previous.exercises;
  const currentExercises = current.exercises;
  const usedPreviousIndexes = new Set<number>();
  const exactPreviousIndexByCurrentIndex = new Map<number, number>();

  for (const [currentIndex, currentExercise] of currentExercises.entries()) {
    const previousIndex = findExactPreviousIndex(previousExercises, usedPreviousIndexes, currentExercise);
    if (previousIndex === -1) {
      continue;
    }

    usedPreviousIndexes.add(previousIndex);
    exactPreviousIndexByCurrentIndex.set(currentIndex, previousIndex);
  }

  const rows: PreviousWorkoutComparisonRow[] = [];

  for (const [currentIndex, currentExercise] of currentExercises.entries()) {
    let previousIndex = exactPreviousIndexByCurrentIndex.get(currentIndex) ?? -1;
    if (previousIndex === -1) {
      previousIndex = findFirstUnusedPreviousIndex(previousExercises, usedPreviousIndexes, currentExercise);
      if (previousIndex !== -1) {
        usedPreviousIndexes.add(previousIndex);
      }
    }

    rows.push(buildCurrentRow(currentExercise, previousIndex === -1 ? undefined : previousExercises[previousIndex]));
  }

  for (const [index, previousExercise] of previousExercises.entries()) {
    if (!usedPreviousIndexes.has(index)) {
      rows.push(buildPreviousOnlyRow(previousExercise));
    }
  }

  return {
    rows,
    previousVolumeKg: totalVolumeKg(previousExercises),
    currentVolumeKg: totalVolumeKg(currentExercises)
  };
}
