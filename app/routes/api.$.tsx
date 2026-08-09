import type { Route } from "./+types/api.$";
import { apiFetch } from "~/lib/http.server";

async function proxy(request: Request) {
  const url = new URL(request.url);

  // Keep the path exactly as the browser requested
  // (e.g. /api/notes/xxx → backend /api/notes/xxx)
  const backendPath = url.pathname;
  const search = url.search;
  const endpoint = `${backendPath}${search}`;

  const headers = new Headers();

  // Forward useful headers
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  if (contentType) headers.set("Content-Type", contentType);
  if (accept) headers.set("Accept", accept);

  // Critical: forward the browser's cookies
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("Cookie", cookie);

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const response = await apiFetch(
    endpoint,
    {
      method: request.method,
      headers,
      body,
    },
    request,
  );

  // ---------- FIXED RESPONSE HANDLING ----------
  const responseHeaders = new Headers();

  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();

    // Never forward these hop-by-hop / encoding headers
    if (
      lower === "connection" ||
      lower === "keep-alive" ||
      lower === "transfer-encoding" ||
      lower === "content-encoding" || // ← this was the culprit
      lower === "content-length" // ← length no longer matches
    ) {
      return;
    }

    responseHeaders.set(key, value);
  });

  // Read the body fully so we control the encoding
  const responseBody = await response.arrayBuffer();

  return new Response(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  return proxy(request);
}

export async function action({ request }: Route.ActionArgs) {
  return proxy(request);
}
