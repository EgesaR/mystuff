export async function apiFetch(
  path: string,
  options: RequestInit = {},
  request?: Request,
) {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  // Forward cookies when called from a loader/action
  if (request) {
    const cookie = request.headers.get("cookie");

    if (cookie) {
      headers.set("Cookie", cookie);
    }
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  return response;
}
