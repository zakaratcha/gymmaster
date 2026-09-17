type BodyInit = Exclude<NonNullable<Parameters<typeof fetch>[1]>['body'], null | undefined>;

export function isBodyInit(data: unknown): data is BodyInit {
  return (
    data instanceof FormData || data instanceof URLSearchParams || data instanceof Blob || data instanceof ArrayBuffer
  );
}
