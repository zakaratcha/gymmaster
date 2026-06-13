import type { Trainer, TrainerRole } from '../../services/trainers/trainers.models.ts';
import type { TrainerRow } from '../db/schema.ts';

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
