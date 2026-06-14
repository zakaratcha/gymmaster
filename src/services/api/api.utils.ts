export function stringifyParams(params: Record<string, string | number | undefined>): Record<string, string> {
  const stringParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    stringParams[key] = String(value);
  }

  return stringParams;
}

function readNodeEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;

  return proc?.env?.[name];
}

function resolveOrigin(baseUrl: string): string {
  if (baseUrl !== '') {
    return baseUrl.replace(/\/$/, '');
  }

  const location = (globalThis as { location?: { origin: string } }).location;
  if (location !== undefined) {
    return location.origin;
  }

  return readNodeEnv('API_BASE_URL') ?? readNodeEnv('E2E_BASE_URL') ?? 'http://127.0.0.1:5173';
}

export function buildRequestUrl(baseUrl: string, path: string, params?: Record<string, string>): string {
  const url = new URL(path, `${resolveOrigin(baseUrl)}/`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  return url.href;
}
