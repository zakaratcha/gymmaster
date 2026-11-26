import {
  type AdminTrainer,
  MIN_TRAINER_PASSWORD_LENGTH,
  type Trainer,
  type TrainerRole,
  type TrainerStatus
} from '../../services/trainers/trainers.models.ts';
import type { TrainerRow } from '../db/schema.ts';

const INVALID_INPUT_ERROR = 'Проверьте введённые данные';
const SHORT_PASSWORD_ERROR = `Пароль должен быть не короче ${MIN_TRAINER_PASSWORD_LENGTH} символов`;

export function trainerRoles(row: TrainerRow): readonly TrainerRole[] {
  const roles: TrainerRole[] = ['trainer'];
  if (row.admin === 1) {
    roles.push('platform_admin');
  }
  return roles;
}

export function toPublicTrainer(row: TrainerRow): Trainer {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    roles: trainerRoles(row)
  };
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** WHATWG HTML Living Standard — valid e-mail address (<input type="email">). */
const EMAIL_PATTERN =
  /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function toAdminTrainer(row: TrainerRow): AdminTrainer {
  return {
    id: row.id,
    email: row.email,
    status: row.status
  };
}

export type ValidatedCreateTrainerInput = {
  readonly email: string;
  readonly password: string;
};

export type ValidatedUpdateTrainerStatusInput = {
  readonly status: TrainerStatus;
};

export type ValidatedResetTrainerPasswordInput = {
  readonly password: string;
};

export type ValidatedChangeOwnPasswordInput = {
  readonly currentPassword: string;
  readonly newPassword: string;
};

type ValidationResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

function readRecordField(record: object, key: string): unknown {
  if (!Object.hasOwn(record, key)) {
    return undefined;
  }

  return Reflect.get(record, key);
}

function validatePassword(password: unknown): ValidationResult<string> {
  if (typeof password !== 'string') {
    return { ok: false, error: INVALID_INPUT_ERROR };
  }

  if (password.length < MIN_TRAINER_PASSWORD_LENGTH) {
    return { ok: false, error: SHORT_PASSWORD_ERROR };
  }

  return { ok: true, value: password };
}

function validateEmail(email: unknown): ValidationResult<string> {
  if (typeof email !== 'string') {
    return { ok: false, error: INVALID_INPUT_ERROR };
  }

  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: INVALID_INPUT_ERROR };
  }

  return { ok: true, value: normalized };
}

export function validateCreateTrainerInput(body: unknown): ValidationResult<ValidatedCreateTrainerInput> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: INVALID_INPUT_ERROR };
  }

  const emailResult = validateEmail(readRecordField(body, 'email'));
  if (!emailResult.ok) {
    return emailResult;
  }

  const passwordResult = validatePassword(readRecordField(body, 'password'));
  if (!passwordResult.ok) {
    return passwordResult;
  }

  return { ok: true, value: { email: emailResult.value, password: passwordResult.value } };
}

export function validateUpdateTrainerStatusInput(body: unknown): ValidationResult<ValidatedUpdateTrainerStatusInput> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: INVALID_INPUT_ERROR };
  }

  const status = readRecordField(body, 'status');
  if (status !== 'active' && status !== 'blocked') {
    return { ok: false, error: INVALID_INPUT_ERROR };
  }

  return { ok: true, value: { status } };
}

export function validateResetTrainerPasswordInput(body: unknown): ValidationResult<ValidatedResetTrainerPasswordInput> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: INVALID_INPUT_ERROR };
  }

  const passwordResult = validatePassword(readRecordField(body, 'password'));
  if (!passwordResult.ok) {
    return passwordResult;
  }

  return { ok: true, value: { password: passwordResult.value } };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function validateChangeOwnPasswordInput(body: unknown): ValidationResult<ValidatedChangeOwnPasswordInput> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: INVALID_INPUT_ERROR };
  }

  const currentPassword = readRecordField(body, 'currentPassword');
  const newPassword = readRecordField(body, 'newPassword');
  if (!isNonEmptyString(currentPassword) || !isNonEmptyString(newPassword)) {
    return { ok: false, error: INVALID_INPUT_ERROR };
  }

  const newPasswordResult = validatePassword(newPassword);
  if (!newPasswordResult.ok) {
    return newPasswordResult;
  }

  return { ok: true, value: { currentPassword, newPassword: newPasswordResult.value } };
}
