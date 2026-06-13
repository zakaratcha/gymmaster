import { api } from './api/api.service';

/** Ответ сервера `GET /api/hello`. */
export type HelloResponse = {
  readonly message: string;
};

function parseHelloResponse(data: unknown): HelloResponse {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = Reflect.get(data, 'message');
    if (typeof message === 'string') {
      return { message };
    }
  }
  throw new Error('Invalid /api/hello JSON shape.');
}

/** Загружает приветствие с API того же происхождения, что и страница. */
export async function fetchHello(options?: { readonly signal?: AbortSignal }): Promise<HelloResponse> {
  const raw: unknown = await api.get('/api/hello', { signal: options?.signal });
  return parseHelloResponse(raw);
}
