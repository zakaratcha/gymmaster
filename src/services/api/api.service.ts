import { CustomCache } from '../common/CustomCache';
import { ApiError, type RequestConfig, type RequestConfigWithCache } from './api.models';
import { isBodyInit } from './api.typeguards';
import { buildCookieHeader, buildRequestUrl, collectCookiesFromResponse, stringifyParams } from './api.utils';

const JSON_PATCH = 'application/merge-patch+json';

function readNodeEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;

  return proc?.env?.[name];
}

function getDefaultBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }

  return readNodeEnv('API_BASE_URL') ?? readNodeEnv('E2E_BASE_URL') ?? 'http://127.0.0.1:5173';
}

class Api {
  private static _instance: Api;

  static get instance(): Api {
    return this._instance || (this._instance = new this());
  }

  baseUrl: string;
  cache: CustomCache<Promise<unknown>>;

  private constructor() {
    this.baseUrl = getDefaultBaseUrl();
    this.cache = new CustomCache({ maxAge: 2 * 60 * 1000 });
  }

  async get<T>(url: string, configWithCache: RequestConfigWithCache = {}): Promise<T> {
    const { cache: cacheConfig, ...config } = configWithCache;
    const stringParams = config.params ? stringifyParams(config.params) : undefined;
    const cacheKey = `GET:${buildRequestUrl(this.baseUrl, url, stringParams)}`;
    const fromCache = this.cache.match(cacheKey, cacheConfig);
    let promise: Promise<T>;

    if (fromCache) {
      promise = fromCache as Promise<T>;
    } else {
      promise = this.createRequestPromise<T>('GET', url, undefined, config);
      this.cache.add(cacheKey, promise, cacheConfig);
    }

    return await promise;
  }

  async post<T>(url: string, data?: unknown, configWithCache: RequestConfigWithCache = {}): Promise<T> {
    const { cache: requestCacheConfig = {}, ...config } = configWithCache;
    const cacheConfig = { disabled: true, clear: true, ...requestCacheConfig };
    const stringParams = config.params ? stringifyParams(config.params) : undefined;
    const cacheKey = `POST:${buildRequestUrl(this.baseUrl, url, stringParams)} DATA:${JSON.stringify(data)}`;
    const fromCache = this.cache.match(cacheKey, cacheConfig);
    let promise: Promise<T>;

    if (fromCache) {
      promise = fromCache as Promise<T>;
    } else {
      promise = this.createRequestPromise<T>('POST', url, data, config);
      this.cache.add(cacheKey, promise, cacheConfig);
    }

    return await promise;
  }

  async put<T>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    this.cache.clear();

    return await this.createRequestPromise<T>('PUT', url, data, config);
  }

  async patch<T>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    this.cache.clear();

    return await this.createRequestPromise<T>('PATCH', url, data, {
      ...config,
      headers: {
        'Content-Type': JSON_PATCH,
        ...config.headers
      }
    });
  }

  async delete<T>(url: string, config: RequestConfig = {}): Promise<T> {
    this.cache.clear();

    return await this.createRequestPromise<T>('DELETE', url, undefined, config);
  }

  private createRequestPromise<T>(method: string, url: string, data: unknown, config: RequestConfig): Promise<T> {
    return (async () => {
      const stringParams = config.params ? stringifyParams(config.params) : undefined;
      const requestUrl = buildRequestUrl(this.baseUrl, url, stringParams);
      const headers = new Headers(config.headers);
      let body: BodyInit | undefined;

      if (data !== undefined && method !== 'GET' && method !== 'DELETE') {
        if (isBodyInit(data)) {
          body = data;
        } else {
          if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
          }
          body = JSON.stringify(data);
        }
      }

      const requestCookies = config.cookies;
      if (requestCookies !== undefined && requestCookies.size > 0) {
        headers.set('Cookie', buildCookieHeader(requestCookies));
      }

      const response = await fetch(requestUrl, {
        method,
        headers,
        body,
        credentials: 'include',
        signal: config.signal
      });

      if (config.collectCookies !== undefined) {
        collectCookiesFromResponse(response, config.collectCookies);
      }

      if (!response.ok) {
        throw new ApiError(response.status, await this.readErrorBody(response));
      }

      return await this.parseResponse<T>(response);
    })();
  }

  private async readErrorBody(response: Response): Promise<unknown> {
    try {
      const contentType = response.headers.get('Content-Type') ?? '';

      if (contentType.includes('json')) {
        return await response.json();
      }

      return await response.text();
    } catch {
      return undefined;
    }
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('Content-Type') ?? '';

    if (contentType.includes('json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  }
}

export const api = Api.instance;

if (typeof window !== 'undefined') {
  Object.assign(window, { api });
}
