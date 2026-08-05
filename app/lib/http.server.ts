import { getApiUrl } from "./config";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  request?: Request,
) {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (request) {
    const cookie = request.headers.get("cookie");

    if (cookie) {
      headers.set("Cookie", cookie);
    }
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${getApiUrl(request)}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
  });
}
