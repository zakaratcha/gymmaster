import { api } from '../../../src/services/api/api.service';

type RequestCookies = ReadonlyMap<string, string>;

function mergeCookies(
  config: { cookies?: RequestCookies } | undefined,
  cookies: RequestCookies | undefined
): { cookies?: RequestCookies } {
  if (cookies === undefined) {
    return config ?? {};
  }

  return { ...config, cookies };
}

function patchApiCookies(cookies: RequestCookies | undefined): () => void {
  const originalGet = api.get;
  const originalPost = api.post;
  const originalDelete = api.delete;
  const originalPatch = api.patch;
  const originalPut = api.put;

  api.get = (url, config) => originalGet(url, mergeCookies(config, cookies));
  api.post = (url, data, config) => originalPost(url, data, mergeCookies(config, cookies));
  api.delete = (url, config) => originalDelete(url, mergeCookies(config, cookies));
  api.patch = (url, data, config) => originalPatch(url, data, mergeCookies(config, cookies));
  api.put = (url, data, config) => originalPut(url, data, mergeCookies(config, cookies));

  return () => {
    api.get = originalGet;
    api.post = originalPost;
    api.delete = originalDelete;
    api.patch = originalPatch;
    api.put = originalPut;
  };
}

export async function withApiCookies<R>(cookies: RequestCookies | undefined, fn: () => Promise<R>): Promise<R> {
  const restore = patchApiCookies(cookies);

  try {
    return await fn();
  } finally {
    restore();
  }
}
