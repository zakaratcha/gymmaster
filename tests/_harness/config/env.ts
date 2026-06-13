export function getBaseUrl(): string {
  const raw = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173';
  return raw.replace(/\/$/, '');
}

export function getHeadless(): boolean {
  const v = process.env.E2E_HEADLESS;
  if (v === undefined || ['true', '1'].includes(v)) {
    return true;
  }
  if (['false', '0'].includes(v)) {
    return false;
  }
  return true;
}
