export function readApiErrorMessage(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }

  if (!Object.hasOwn(body, 'error')) {
    return undefined;
  }

  const error: unknown = Reflect.get(body, 'error');

  return typeof error === 'string' ? error : undefined;
}
