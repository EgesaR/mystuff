import { API_URL } from "~/lib/config";

/**
 * Client-side fetch wrapper for the FastAPI backend.
 * Use from event handlers/effects (browser-only code).
 * For loaders/actions, use `apiFetch` from `~/lib/http.server` instead.
 */

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {},
): Promise<Response> {
  // Default to 3 retries, starting with a 1-second delay
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  const fullUrl = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL || ""}${endpoint}`;
  console.log("full Url",fullUrl)
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(fullUrl, {
      headers,
      credentials: "include",
      ...fetchOptions,
    });
    // If the server is still booting, host providers
    // often return 502 Bad Gateway or 503 Service Unavailable.
    if (!response.ok && response.status >= 500 && retries > 0) {
      console.warn(
        `[apiFetch] Server returned ${response.status} for ${endpoint}. Retrying in ${retryDelay}ms... (${retries} left)`,
      );

      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      // Recursive retry with exponential backoff (delay * 1.5)
      return apiFetch(endpoint, {
        ...options,
        retries: retries - 1,
        retryDelay: retryDelay * 1.5,
        headers,
        credentials: "include",
      });
    }
    // Return the response for 2xx, 3xx, and 4xx (client errors shouldn't be retried)
    return response;
  } catch (error) {
    // Hard network errors (e.g., DNS resolution failed, connection refused)
    // will throw an exception before a Response object is ever created.
    if (retries > 0) {
      console.warn(
        `[apiFetch] Network error for ${endpoint}. Retrying in ${retryDelay}ms... (${retries} left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      return apiFetch(endpoint, {
        ...options,
        headers,
        credentials: "include",
        retries: retries - 1,
        retryDelay: retryDelay * 1.5,
      });
    }

    // If we are completely out of retries, throw the error so the caller can handle it
    throw error;
  }
}
