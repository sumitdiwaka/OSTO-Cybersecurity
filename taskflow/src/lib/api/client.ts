/**
 * Thin fetch wrapper. This is the one place that knows how to talk HTTP —
 * every hook in src/hooks calls through here rather than calling fetch()
 * directly, which is what "design a clean abstraction for API
 * interaction" means in practice: one chokepoint for headers, error
 * shape, and the session-expiry contract.
 */

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const SESSION_EXPIRED_EVENT = "taskflow:session-expired";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new ApiError(
      res.status,
      typeof body.error === "string" ? body.error : "UNKNOWN",
      typeof body.message === "string" ? body.message : "Something went wrong. Please try again."
    );
    if (res.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    throw error;
  }

  return body as T;
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T,>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function onSessionExpired(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
}
