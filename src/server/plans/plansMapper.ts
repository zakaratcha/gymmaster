import type { PlannedExerciseInput, PlannedSetInput } from '../../services/plans/plans.models.ts';
import { isArray } from '../../services/util/typeGuards/isArray.ts';

export type ValidatedPlannedSetInput = PlannedSetInput;
export type ValidatedPlannedExerciseInput = PlannedExerciseInput;

export type ValidatedCreatePlanInput = {
  readonly plannedDate: string;
  readonly splitTag: string;
  readonly exercises: readonly ValidatedPlannedExerciseInput[];
};

export type ValidatedUpdatePlanInput = {
  readonly plannedDate?: string;
  readonly splitTag?: string;
  readonly exercises?: readonly ValidatedPlannedExerciseInput[];
};

type ValidationResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

function readRecordField(record: object, key: string): unknown {
  if (!Object.hasOwn(record, key)) {
    return undefined;
  }

  return Reflect.get(record, key);
}

function parseDate(value: unknown): ValidationResult<string> {
  if (value === undefined) {
    return { ok: false, error: 'Поле plannedDate обязательно' };
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { ok: false, error: 'Поле plannedDate должно быть датой в формате YYYY-MM-DD' };
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return { ok: false, error: 'Поле plannedDate должно быть датой в формате YYYY-MM-DD' };
  }

  return { ok: true, value };
}

function parseRequiredString(value: unknown, fieldName: string): ValidationResult<string> {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { ok: false, error: `Поле ${fieldName} обязательно` };
  }

  return { ok: true, value: value.trim() };
}

function parseSet(value: unknown): ValidationResult<ValidatedPlannedSetInput> {
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

function parseExercise(value: unknown): ValidationResult<ValidatedPlannedExerciseInput> {
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

  const sets: PlannedSetInput[] = [];
  for (const setValue of setsValue) {
    const set = parseSet(setValue);
    if (!set.ok) {
      return set;
    }

    sets.push(set.value);
  }

  return { ok: true, value: { exerciseId: exerciseId.value, sets } };
}

function parseExercises(value: unknown): ValidationResult<readonly ValidatedPlannedExerciseInput[]> {
  if (!isArray(value)) {
    return { ok: false, error: 'Поле exercises должно быть массивом' };
  }

  const exercises: ValidatedPlannedExerciseInput[] = [];
  for (const exerciseValue of value) {
    const exercise = parseExercise(exerciseValue);
    if (!exercise.ok) {
      return exercise;
    }

    exercises.push(exercise.value);
  }

  return { ok: true, value: exercises };
}

export function validateCreatePlanInput(body: unknown): ValidationResult<ValidatedCreatePlanInput> {
  if (typeof body !== 'object' || body === null || isArray(body)) {
    return { ok: false, error: 'Некорректное тело запроса' };
  }

  const plannedDate = parseDate(readRecordField(body, 'plannedDate'));
  if (!plannedDate.ok) {
    return plannedDate;
  }

  const splitTag = parseRequiredString(readRecordField(body, 'splitTag'), 'splitTag');
  if (!splitTag.ok) {
    return splitTag;
  }

  const exercises = parseExercises(readRecordField(body, 'exercises'));
  if (!exercises.ok) {
    return exercises;
  }

  return { ok: true, value: { plannedDate: plannedDate.value, splitTag: splitTag.value, exercises: exercises.value } };
}

export function validateUpdatePlanInput(body: unknown): ValidationResult<ValidatedUpdatePlanInput> {
  if (typeof body !== 'object' || body === null || isArray(body)) {
    return { ok: false, error: 'Некорректное тело запроса' };
  }

  const value: {
    plannedDate?: string;
    splitTag?: string;
    exercises?: readonly ValidatedPlannedExerciseInput[];
  } = {};
  const hasPlannedDate = Object.hasOwn(body, 'plannedDate');
  const hasSplitTag = Object.hasOwn(body, 'splitTag');
  const hasExercises = Object.hasOwn(body, 'exercises');

  if (hasPlannedDate) {
    const plannedDate = parseDate(readRecordField(body, 'plannedDate'));
    if (!plannedDate.ok) {
      return plannedDate;
    }

    value.plannedDate = plannedDate.value;
  }

  if (hasSplitTag) {
    const splitTag = parseRequiredString(readRecordField(body, 'splitTag'), 'splitTag');
    if (!splitTag.ok) {
      return splitTag;
    }

    value.splitTag = splitTag.value;
  }

  if (hasExercises) {
    const exercises = parseExercises(readRecordField(body, 'exercises'));
    if (!exercises.ok) {
      return exercises;
    }

    value.exercises = exercises.value;
  }

  if (!hasPlannedDate && !hasSplitTag && !hasExercises) {
    return { ok: false, error: 'Нет полей для обновления' };
  }

  return { ok: true, value };
}
