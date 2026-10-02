import { isArray } from '../../services/util/typeGuards/isArray.ts';
import type {
  CreateWorkoutSessionRequest,
  UpdateWorkoutSessionRequest,
  WorkoutSessionExerciseInput,
  WorkoutSessionSet
} from '../../services/workoutSessions/workoutSessions.models.ts';

export type ValidatedCreateWorkoutSessionInput = CreateWorkoutSessionRequest;
export type ValidatedUpdateWorkoutSessionInput = UpdateWorkoutSessionRequest;

type ValidationResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

function readRecordField(record: object, key: string): unknown {
  if (!Object.hasOwn(record, key)) {
    return undefined;
  }

  return Reflect.get(record, key);
}

function parseRequiredString(value: unknown, fieldName: string): ValidationResult<string> {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { ok: false, error: `Поле ${fieldName} обязательно` };
  }

  return { ok: true, value: value.trim() };
}

function parseSet(value: unknown): ValidationResult<WorkoutSessionSet> {
  if (typeof value !== 'object' || value === null || isArray(value)) {
    return { ok: false, error: 'Некорректный подход' };
  }

  const reps = readRecordField(value, 'reps');
  if (typeof reps !== 'number' || !Number.isInteger(reps) || reps <= 0) {
    return { ok: false, error: 'Поле reps должно быть положительным целым числом' };
  }

  const weightKg = readRecordField(value, 'weightKg');
  if (typeof weightKg !== 'number' || !Number.isFinite(weightKg) || weightKg < 0) {
    return { ok: false, error: 'Поле weightKg должно быть неотрицательным числом' };
  }

  return { ok: true, value: { reps, weightKg } };
}

function parseExercise(value: unknown): ValidationResult<WorkoutSessionExerciseInput> {
  if (typeof value !== 'object' || value === null || isArray(value)) {
    return { ok: false, error: 'Некорректное упражнение' };
  }

  const exerciseId = parseRequiredString(readRecordField(value, 'exerciseId'), 'exerciseId');
  if (!exerciseId.ok) {
    return exerciseId;
  }

  const setsValue = readRecordField(value, 'sets');
  if (!isArray(setsValue)) {
    return { ok: false, error: 'Поле sets должно быть массивом' };
  }

  const sets: WorkoutSessionSet[] = [];
  for (const setValue of setsValue) {
    const set = parseSet(setValue);
    if (!set.ok) {
      return set;
    }

    sets.push(set.value);
  }

  return { ok: true, value: { exerciseId: exerciseId.value, sets } };
}

function parseExercises(value: unknown): ValidationResult<readonly WorkoutSessionExerciseInput[]> {
  if (!isArray(value)) {
    return { ok: false, error: 'Поле exercises должно быть массивом' };
  }

  const exercises: WorkoutSessionExerciseInput[] = [];
  for (const exerciseValue of value) {
    const exercise = parseExercise(exerciseValue);
    if (!exercise.ok) {
      return exercise;
    }

    exercises.push(exercise.value);
  }

  return { ok: true, value: exercises };
}

export function validateCreateWorkoutSessionInput(body: unknown): ValidationResult<ValidatedCreateWorkoutSessionInput> {
  if (typeof body !== 'object' || body === null || isArray(body)) {
    return { ok: false, error: 'Некорректное тело запроса' };
  }

  const plannedWorkoutId = parseRequiredString(readRecordField(body, 'plannedWorkoutId'), 'plannedWorkoutId');
  if (!plannedWorkoutId.ok) {
    return plannedWorkoutId;
  }

  return { ok: true, value: { plannedWorkoutId: plannedWorkoutId.value } };
}

export function validateUpdateWorkoutSessionInput(body: unknown): ValidationResult<ValidatedUpdateWorkoutSessionInput> {
  if (typeof body !== 'object' || body === null || isArray(body)) {
    return { ok: false, error: 'Некорректное тело запроса' };
  }

  const exercises = parseExercises(readRecordField(body, 'exercises'));
  if (!exercises.ok) {
    return exercises;
  }

  return { ok: true, value: { exercises: exercises.value } };
}
