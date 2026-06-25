const DEFAULT_TIMEOUT_MS = 12_000;

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { timeoutMs: _t, ...rest } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, { ...rest, signal: controller.signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const body = err as { error?: string; code?: string; sessions?: unknown[] };
      const error = new Error(body.error || `Request failed (${res.status})`) as Error & {
        code?: string;
        sessions?: unknown[];
        status?: number;
      };
      error.code = body.code;
      error.sessions = body.sessions;
      error.status = res.status;
      throw error;
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}