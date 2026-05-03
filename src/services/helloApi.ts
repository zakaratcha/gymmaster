/** Ответ сервера `GET /api/hello`. */
export type HelloResponse = {
  readonly message: string;
};

function parseHelloResponse(data: unknown): HelloResponse {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    return {
      message: (data as { message: string }).message,
    };
  }
  throw new Error("Invalid /api/hello JSON shape.");
}

/** Загружает приветствие с API того же происхождения, что и страница. */
export async function fetchHello(options?: {
  readonly signal?: AbortSignal;
}): Promise<HelloResponse> {
  const res = await fetch("/api/hello", {
    signal: options?.signal,
  });
  if (!res.ok) {
    throw new Error(`GET /api/hello failed: HTTP ${String(res.status)}`);
  }
  const raw: unknown = await res.json();
  return parseHelloResponse(raw);
}
