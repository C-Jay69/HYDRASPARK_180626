import { hc } from "hono/client";
import type { AppType } from "../../api";

export const api = hc<AppType>(window.location.origin);

// Auth helpers using better-auth client pattern
export async function authFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("hs_token");
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await authFetch(`/api${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}
