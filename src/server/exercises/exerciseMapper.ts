import type { Exercise } from '../../services/exercises/exercises.models.ts';
import type { ExerciseRow } from '../db/schema.ts';

export function toPublicExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    ...(row.notes === null ? {} : { notes: row.notes }),
    ...(row.archivedAt === null ? {} : { archivedAt: row.archivedAt })
  };
}

export type ValidatedCreateExerciseInput = {
  readonly name: string;
  readonly notes?: string;
};

export type ValidatedUpdateExerciseInput = {
  readonly name?: string;
  readonly notes?: string | null;
  readonly archived?: boolean;
};

type ValidationResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

function readRecordField(record: object, key: string): unknown {
  if (!Object.hasOwn(record, key)) {
    return undefined;
  }

  return Reflect.get(record, key);
}

function parseName(value: unknown, fieldName: string): ValidationResult<string> {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { ok: false, error: `Поле ${fieldName} обязательно` };
  }

  return { ok: true, value: value.trim() };
}

function parseOptionalNotes(value: unknown, fieldName: string): ValidationResult<string | undefined> {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (typeof value !== 'string') {
    return { ok: false, error: `Поле ${fieldName} должно быть строкой` };
  }

  return { ok: true, value: value };
}

function parseArchived(value: unknown): ValidationResult<boolean> {
  if (typeof value !== 'boolean') {
    return { ok: false, error: 'Поле archived должно быть логическим значением' };
  }

  return { ok: true, value };
}

export function validateCreateExerciseInput(body: unknown): ValidationResult<ValidatedCreateExerciseInput> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Некорректное тело запроса' };
  }

  const nameResult = parseName(readRecordField(body, 'name'), 'name');
  if (!nameResult.ok) {
    return nameResult;
  }

  const notesResult = parseOptionalNotes(readRecordField(body, 'notes'), 'notes');
  if (!notesResult.ok) {
    return notesResult;
  }

  return {
    ok: true,
    value: {
      name: nameResult.value,
      ...(notesResult.value === undefined ? {} : { notes: notesResult.value })
    }
  };
}

export function validateUpdateExerciseInput(body: unknown): ValidationResult<ValidatedUpdateExerciseInput> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Некорректное тело запроса' };
  }

  const value: {
    name?: string;
    notes?: string | null;
    archived?: boolean;
  } = {};
  const hasName = Object.hasOwn(body, 'name');
  const hasNotes = Object.hasOwn(body, 'notes');
  const hasArchived = Object.hasOwn(body, 'archived');

  if (hasName) {
    const nameResult = parseName(readRecordField(body, 'name'), 'name');
    if (!nameResult.ok) {
      return nameResult;
    }
    value.name = nameResult.value;
  }

  if (hasNotes) {
    const notes = readRecordField(body, 'notes');
    if (notes === null) {
      value.notes = null;
    } else {
      const notesResult = parseOptionalNotes(notes, 'notes');
      if (!notesResult.ok) {
        return notesResult;
      }
      value.notes = notesResult.value;
    }
  }

  if (hasArchived) {
    const archivedResult = parseArchived(readRecordField(body, 'archived'));
    if (!archivedResult.ok) {
      return archivedResult;
    }
    value.archived = archivedResult.value;
  }

  if (!hasName && !hasNotes && !hasArchived) {
    return { ok: false, error: 'Нет полей для обновления' };
  }

  return { ok: true, value };
}
