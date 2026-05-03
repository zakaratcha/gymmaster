export function getBaseUrl(): string {
  const raw = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5173";
  return raw.replace(/\/$/, "");
}

export function getHeadless(): boolean {
  const v = process.env.E2E_HEADLESS;
  if (v === undefined || v === "true" || v === "1") {
    return true;
  }
  if (v === "false" || v === "0") {
    return false;
  }
  return true;
}
