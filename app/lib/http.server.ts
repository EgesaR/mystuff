import { getApiUrl } from "./config";

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  request?: Request,
) {
  const headers = new Headers(options.headers as HeadersInit);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Forward cookies when called from a loader/action
  if (request) {
    const cookie = request.headers.get("cookie");

    if (cookie) {
      headers.set("Cookie", cookie);
    }
  }

  const base = getApiUrl(request);
  const url =
    path.startsWith("http://") || path.startsWith("https://")
      ? path
      : new URL(path, base).toString();

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  return response;
}
