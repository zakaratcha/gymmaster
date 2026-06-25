export function isBodyInit(data: unknown): data is BodyInit {
  return (
    data instanceof FormData || data instanceof URLSearchParams || data instanceof Blob || data instanceof ArrayBuffer
  );
}
