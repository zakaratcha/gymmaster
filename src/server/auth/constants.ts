export const SESSION_COOKIE = 'gm_session';

export const SESSION_TTL_DAYS = Number.parseInt(process.env.SESSION_TTL_DAYS ?? '30', 10);

export function sessionMaxAgeMs(): number {
  if (!Number.isInteger(SESSION_TTL_DAYS) || SESSION_TTL_DAYS < 1) {
    throw new Error('Invalid SESSION_TTL_DAYS environment variable.');
  }
  return SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
