import type { Route } from "./+types/api.$";
import { apiFetch } from "~/lib/http.server";

async function proxy(request: Request) {
  const url = new URL(request.url);

  // Remove the Vercel route prefix.
  //
  // Example:
  // /api/notes
  //
  // becomes:
  // /api/notes
  //
  // because the backend also expects /api/...
  const backendPath = url.pathname;

  const search = url.search;

  const endpoint = `${backendPath}${search}`;

  const headers = new Headers();

  // Forward headers that are useful to FastAPI.
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (accept) {
    headers.set("Accept", accept);
  }

  // CRITICAL:
  //
  // The browser's access_token belongs to
  // mystuffs.vercel.app.
  //
  // We explicitly forward the Cookie header to Render.
  const cookie = request.headers.get("cookie");

  if (cookie) {
    headers.set("Cookie", cookie);
  }

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

  // Copy backend response headers back to browser.
  const responseHeaders = new Headers();

  response.headers.forEach((value, key) => {
    // Don't blindly forward hop-by-hop headers.
    if (
      key !== "connection" &&
      key !== "keep-alive" &&
      key !== "transfer-encoding"
    ) {
      responseHeaders.set(key, value);
    }
  });

  return new Response(response.body, {
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
