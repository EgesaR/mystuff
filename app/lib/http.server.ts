import { API_URL } from "./config";

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  request?: Request,
) {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  // Forward cookies when called from a loader/action
  if (request) {
    const cookie = request.headers.get("cookie");

    if (cookie) {
      headers.set("Cookie", cookie);
    }
  }

  const url =
    path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  return response;
}
