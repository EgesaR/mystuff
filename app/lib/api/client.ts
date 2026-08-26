/**
 * Thin fetch helper for browser/client-side API requests.
 *
 * Browser requests use the same-origin /api/* proxy so that
 * authentication cookies remain first-party.
 */

import { API_TIMEOUT } from "./constants";
import { normalizedPath } from "./utils";

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

/**
 * Determines whether a URL is already absolute.
 */
function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Only retry requests that are safe to repeat.
 *
 * GET/HEAD/OPTIONS are generally safe.
 *
 * POST/PATCH/PUT/DELETE are intentionally excluded because
 * automatically repeating them can cause duplicate side effects.
 */
function shouldRetry(method: string): boolean {
  return ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

/**
 * Extracts a useful error message from a FastAPI response.
 */
async function getErrorMessage(response: Response): Promise<string> {
  let message = `API request failed: ${response.status} ${response.statusText}`;

  try {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const data: unknown = await response.json();

      if (
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof data.detail === "string"
      ) {
        return data.detail;
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }
    } else {
      const text = await response.text();

      if (text) {
        message = text;
      }
    }
  } catch {
    // Keep the default HTTP error message.
  }

  return message;
}

/**
 * Builds the request URL.
 *
 * Browser:
 *   /notes -> /notes
 *
 * Explicit absolute URL:
 *   https://example.com/notes -> unchanged
 *
 * This intentionally does NOT use API_BASE in the browser.
 * The browser should hit your same-origin /api proxy.
 */
function buildUrl(endpoint: string): string {
  if (isAbsoluteUrl(endpoint)) {
    return endpoint;
  }

  return normalizedPath(endpoint);
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { retries = 0, retryDelay = 1_000, ...fetchOptions } = options;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT);

  const onAbort = () => {
    controller.abort();
  };

  if (fetchOptions.signal) {
    if (fetchOptions.signal.aborted) {
      controller.abort();
    } else {
      fetchOptions.signal.addEventListener("abort", onAbort, { once: true });
    }
  }

  const headers = new Headers(fetchOptions.headers);

  headers.set("Accept", "application/json");

  /*
   * Automatically mark string bodies as JSON.
   *
   * FormData, Blob, URLSearchParams, etc. are left alone so
   * fetch/the browser can set their appropriate Content-Type.
   */
  if (
    fetchOptions.body &&
    typeof fetchOptions.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const url = buildUrl(endpoint);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers,

      /*
       * Send authentication cookies with same-origin requests.
       */
      credentials: "include",
    });

    const method = fetchOptions.method ?? "GET";

    /*
     * Retry server errors only for safe requests.
     */
    if (response.status >= 500 && retries > 0 && shouldRetry(method)) {
      await new Promise((resolve) => {
        setTimeout(resolve, retryDelay);
      });

      return apiFetch<T>(endpoint, {
        ...options,
        retries: retries - 1,
        retryDelay: retryDelay * 1.5,
      });
    }

    if (!response.ok) {
      const message = await getErrorMessage(response);

      throw new Response(message, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    /*
     * 204 No Content has no body.
     */
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  } catch (error) {
    /*
     * AbortError can mean:
     *
     * 1. The caller cancelled the request.
     * 2. Our timeout fired.
     */
    if (error instanceof DOMException && error.name === "AbortError") {
      /*
       * Preserve intentional caller cancellation.
       */
      if (fetchOptions.signal?.aborted) {
        throw error;
      }

      /*
       * Timeout retry.
       */
      if (retries > 0 && shouldRetry(fetchOptions.method ?? "GET")) {
        await new Promise((resolve) => {
          setTimeout(resolve, retryDelay);
        });

        return apiFetch<T>(endpoint, {
          ...options,
          retries: retries - 1,
          retryDelay: retryDelay * 1.5,
        });
      }

      throw new Response("The API request timed out.", {
        status: 504,
        statusText: "Gateway Timeout",
      });
    }

    /*
     * Network errors can be retried for safe requests.
     */
    if (
      retries > 0 &&
      shouldRetry(fetchOptions.method ?? "GET") &&
      error instanceof TypeError
    ) {
      await new Promise((resolve) => {
        setTimeout(resolve, retryDelay);
      });

      return apiFetch<T>(endpoint, {
        ...options,
        retries: retries - 1,
        retryDelay: retryDelay * 1.5,
      });
    }

    throw error;
  } finally {
    clearTimeout(timeout);

    if (fetchOptions.signal) {
      fetchOptions.signal.removeEventListener("abort", onAbort);
    }
  }
}
