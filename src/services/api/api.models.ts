import type { CustomCacheConfig } from '../common/CustomCache';

export interface ServerError {
  status: string;
  message: string;
  errors: unknown[];
}

export interface RequestConfig {
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Куки только для этого запроса (harness в Node). */
  cookies?: ReadonlyMap<string, string>;
  /** Сохранить Set-Cookie из ответа (harness в Node). */
  collectCookies?: Map<string, string>;
}

export interface RequestConfigWithCache extends RequestConfig {
  cache?: CustomCacheConfig;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `HTTP ${String(status)}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
