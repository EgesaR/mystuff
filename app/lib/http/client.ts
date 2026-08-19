// lib/http.client.ts

import { getApiUrl } from "../config";

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // CRITICAL: always use relative URLs in the browser so requests
  // hit the Vercel /api/* proxy (same-origin cookies).
  // Only use the absolute backend URL when running on the server
  // or when an explicit absolute URL is passed.
  const isBrowser = typeof window !== "undefined";
  const url =
    endpoint.startsWith("http") || !isBrowser
      ? endpoint.startsWith("http")
        ? endpoint
        : `${getApiUrl()}${endpoint}`
      : endpoint; // relative → /api/notes goes to mystuffs.vercel.app/api/notes

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include", // still required
    });

    if (response.status >= 500 && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return apiFetch(endpoint, {
        ...options,
        retries: retries - 1,
        retryDelay: retryDelay * 1.5,
      });
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return apiFetch(endpoint, {
        ...options,
        retries: retries - 1,
        retryDelay: retryDelay * 1.5,
      });
    }
    throw error;
  }
}
