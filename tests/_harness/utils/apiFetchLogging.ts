/* eslint-disable no-console */

import { logLevel } from './logLevel';

const colors = {
  red: '\u001B[31m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
  magenta: '\u001B[35m',
  cyan: '\u001B[36m',
  gray: '\u001B[37m',
  none: '\u001B[0m'
};

const methodColors = {
  get: colors.yellow,
  post: colors.blue,
  put: colors.magenta,
  patch: colors.magenta,
  delete: colors.red
};

function readRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.href;
  }

  return input.url;
}

function readRequestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (input instanceof Request) {
    return input.method;
  }

  return init?.method ?? 'GET';
}

function readRequestBody(input: RequestInfo | URL, init?: RequestInit): unknown {
  if (input instanceof Request) {
    return undefined;
  }

  return init?.body;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const clone = response.clone();
  const contentType = clone.headers.get('Content-Type') ?? '';

  if (clone.status === 204) {
    return undefined;
  }

  try {
    if (contentType.includes('json')) {
      return await clone.json();
    }

    return await clone.text();
  } catch {
    return undefined;
  }
}

let installed = false;

export function installApiFetchLogging(): void {
  if (installed) {
    return;
  }

  installed = true;

  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = readRequestUrl(input);
    const method = readRequestMethod(input, init);
    const data = readRequestBody(input, init);

    if (logLevel()) {
      console.log('');
      console.log(
        colors.gray,
        'REQUEST',
        methodColors[method.toLocaleLowerCase() as keyof typeof methodColors] || colors.none,
        method.toLocaleUpperCase(),
        colors.cyan,
        url
      );

      if (data !== undefined) {
        try {
          console.log(colors.gray, 'REQUEST DATA:', colors.none, JSON.stringify(data));
        } catch {
          console.log(colors.gray, 'REQUEST DATA:', colors.none, data);
        }
      }

      console.log('');
    }

    const response = await originalFetch(input, init);

    if (logLevel()) {
      const responseData = await readResponseBody(response);

      console.log('');
      console.log(
        colors.gray,
        'RESPONSE',
        response.ok ? colors.green : colors.red,
        response.status,
        methodColors[method.toLocaleLowerCase() as keyof typeof methodColors] || colors.none,
        method.toLocaleUpperCase(),
        colors.cyan,
        url
      );
      console.log(colors.gray, 'RESPONSE DATA:', colors.none, responseData);
      console.log('');
    } else if (!response.ok && logLevel('warn')) {
      console.log('');
      console.log(
        colors.gray,
        'RESPONSE',
        colors.red,
        response.status,
        methodColors[method.toLocaleLowerCase() as keyof typeof methodColors] || colors.none,
        method.toLocaleUpperCase(),
        colors.cyan,
        url
      );
      console.log('');
    }

    return response;
  };
}
