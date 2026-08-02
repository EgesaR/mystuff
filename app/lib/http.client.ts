import { getApiUrl } from "~/lib/config";

/**
 * Client-side fetch wrapper for the backend.
 * Use from event handlers/effects (browser-only code).
 * For loaders/actions, use the server helper in ~/lib/http.server.
 */

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  const base = getApiUrl(); // resolved from window location in browser
  // Prefer relative paths for same-origin requests so the dev server proxy or same-origin
  // hosting can handle forwarding and cookies naturally. Only build an absolute URL
  // when an absolute endpoint is provided or a non-root-relative path is used.
  const fullUrl = endpoint.startsWith("http")
    ? endpoint
    : endpoint.startsWith("/")
    ? endpoint // relative - same origin
    : new URL(endpoint, base).toString();

  const headers = new Headers(fetchOptions.headers as HeadersInit);
  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });

    if (!response.ok && response.status >= 500 && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return apiFetch(endpoint, {
        ...options,
        retries: retries - 1,
        retryDelay: Math.round(retryDelay * 1.5),
      });
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return apiFetch(endpoint, {
        ...options,
        retries: retries - 1,
        retryDelay: Math.round(retryDelay * 1.5),
      });
    }

    throw error;
  }
}
