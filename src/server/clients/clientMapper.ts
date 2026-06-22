import type { Client } from '../../services/clients/clients.models.ts';
import type { ClientRow } from '../db/schema.ts';

export function toPublicClient(row: ClientRow): Client {
  const client: Client = {
    id: row.id,
    name: row.name,
    ...(row.notes === null ? {} : { notes: row.notes }),
    ...(row.bodyWeightKg === null ? {} : { bodyWeightKg: row.bodyWeightKg })
  };

  return client;
}

export type ValidatedCreateClientInput = {
  readonly name: string;
  readonly notes?: string;
  readonly bodyWeightKg?: number;
};

export type ValidatedUpdateClientInput = {
  readonly name?: string;
  readonly notes?: string;
  readonly bodyWeightKg?: number;
};

type ValidationResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

function readRecordField(record: object, key: string): unknown {
  if (!Object.hasOwn(record, key)) {
    return undefined;
  }

  return Reflect.get(record, key);
}

function parseOptionalNotes(value: unknown): ValidationResult<string | undefined> {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (typeof value !== 'string') {
    return { ok: false, error: 'Поле notes должно быть строкой' };
  }

  return { ok: true, value };
}

function parseOptionalBodyWeightKg(value: unknown): ValidationResult<number | undefined> {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return { ok: false, error: 'Поле bodyWeightKg должно быть положительным числом' };
  }

  return { ok: true, value };
}

export function validateCreateClientInput(body: unknown): ValidationResult<ValidatedCreateClientInput> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Некорректное тело запроса' };
  }

  const name = readRecordField(body, 'name');

  if (typeof name !== 'string' || name.trim().length === 0) {
    return { ok: false, error: 'Поле name обязательно' };
  }

  const notesResult = parseOptionalNotes(readRecordField(body, 'notes'));
  if (!notesResult.ok) {
    return notesResult;
  }

  const bodyWeightResult = parseOptionalBodyWeightKg(readRecordField(body, 'bodyWeightKg'));
  if (!bodyWeightResult.ok) {
    return bodyWeightResult;
  }

  return {
    ok: true,
    value: {
      name: name.trim(),
      ...(notesResult.value === undefined ? {} : { notes: notesResult.value }),
      ...(bodyWeightResult.value === undefined ? {} : { bodyWeightKg: bodyWeightResult.value })
    }
  };
}

export function validateUpdateClientInput(body: unknown): ValidationResult<ValidatedUpdateClientInput> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Некорректное тело запроса' };
  }

  const value: ValidatedUpdateClientInput = {};
  const name = readRecordField(body, 'name');

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return { ok: false, error: 'Поле name не может быть пустым' };
    }

    Object.assign(value, { name: name.trim() });
  }

  const notes = readRecordField(body, 'notes');
  if (notes !== undefined) {
    const notesResult = parseOptionalNotes(notes);
    if (!notesResult.ok) {
      return notesResult;
    }

    Object.assign(value, { notes: notesResult.value });
  }

  const bodyWeightKg = readRecordField(body, 'bodyWeightKg');
  if (bodyWeightKg !== undefined) {
    const bodyWeightResult = parseOptionalBodyWeightKg(bodyWeightKg);
    if (!bodyWeightResult.ok) {
      return bodyWeightResult;
    }

    Object.assign(value, { bodyWeightKg: bodyWeightResult.value });
  }

  if (Object.keys(value).length === 0) {
    return { ok: false, error: 'Нет полей для обновления' };
  }

  return { ok: true, value };
}
