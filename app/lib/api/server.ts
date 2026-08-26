/**
 * Thin fetch helper for calling the FastAPI backend
 * from React Router route loaders/actions.
 */

import { API_BASE, API_TIMEOUT } from "./constants";
import { normalizedPath } from "./utils";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  request?: Request,
): Promise<T> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT);

  const onAbort = () => {
    controller.abort();
  };

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", onAbort, {
        once: true,
      });
    }
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  /*
   * Only assume JSON when the caller supplied a string body.
   *
   * This prevents breaking FormData uploads.
   */
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  /*
   * React Router's incoming request contains the user's
   * authentication cookies. Forward them to FastAPI.
   */
  if (request) {
    const cookie = request.headers.get("cookie");

    if (cookie) {
      headers.set("Cookie", cookie);
    }
  }

  try {
    const response = await fetch(`${API_BASE}${normalizedPath(path)}`, {
      ...options,
      signal: controller.signal,
      headers,
    });

    if (!response.ok) {
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
            message = data.detail;
          } else if (
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof data.message === "string"
          ) {
            message = data.message;
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

      throw new Response(message, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    /*
     * 204 No Content has no JSON body.
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
     * Don't convert a caller-initiated abort into a timeout.
     */
    if (error instanceof DOMException && error.name === "AbortError") {
      if (options.signal?.aborted) {
        throw error;
      }

      throw new Response("The API request timed out.", {
        status: 504,
        statusText: "Gateway Timeout",
      });
    }

    throw error;
  } finally {
    clearTimeout(timeout);

    if (options.signal) {
      options.signal.removeEventListener("abort", onAbort);
    }
  }
}
