/**
 * Thin fetch helper for calling the FastAPI backend from
 * React Router route loaders/actions.
 *
 * API_BASE_URL should include the `/api` prefix:
 *
 * Development:
 *   http://localhost:8000/api
 *
 * Production:
 *   https://your-api.example.com/api
 */

export const API_BASE = process.env.API_BASE_URL ?? "http://localhost:8000/api";
const API_TIMEOUT = 30_000;

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT);

  // If the caller supplied their own AbortSignal, abort our
  // controller when their signal aborts as well.
  const onAbort = () => controller.abort();

  if (init.signal) {
    if (init.signal.aborted) {
      controller.abort();
    } else {
      init.signal.addEventListener("abort", onAbort, { once: true });
    }
  }

  try {
    const res = await fetch(`${API_BASE}${normalizedPath}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...init.headers,
      },
    });

    if (!res.ok) {
      let message = `API request failed: ${res.status} ${res.statusText}`;

      try {
        const contentType = res.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
          const data: unknown = await res.json();

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
          const text = await res.text();

          if (text) {
            message = text;
          }
        }
      } catch {
        // Keep the default HTTP error message.
      }

      throw new Response(message, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Response("The API request timed out.", {
        status: 504,
        statusText: "Gateway Timeout",
      });
    }

    throw error;
  } finally {
    clearTimeout(timeout);

    if (init.signal) {
      init.signal.removeEventListener("abort", onAbort);
    }
  }
}
