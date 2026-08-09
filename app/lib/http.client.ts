// lib/http.client.ts

import { getApiUrl } from "./config";

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

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${getApiUrl()}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include",
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
