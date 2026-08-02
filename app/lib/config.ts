export const BACKEND_PORT = Number(import.meta.env.VITE_API_PORT ?? 8000);

const OVERRIDE_API_URL = import.meta.env.VITE_API_URL ?? "";
const OVERRIDE_WS_URL = import.meta.env.VITE_WS_URL ?? "";

function stripTrailingSlash(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

export function getApiUrl(request?: Request): string {
  if (OVERRIDE_API_URL) return stripTrailingSlash(OVERRIDE_API_URL);

  // Server-side: derive origin from request and forwarded headers when present
  if (request) {
    const forwardedProto =
      request.headers.get("x-forwarded-proto") ||
      request.headers.get("x-forwarded-protocol");
    const proto =
      forwardedProto ?? new URL(request.url).protocol.replace(":", "") ?? "http";

    const forwardedHost =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    const hostname = forwardedHost
      ? forwardedHost.split(":")[0]
      : new URL(request.url).hostname;

    return stripTrailingSlash(`${proto}://${hostname}:${BACKEND_PORT}`);
  }

  // Browser
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.port = String(BACKEND_PORT);
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return stripTrailingSlash(url.origin);
  }

  return `http://localhost:${BACKEND_PORT}`;
}

export function getWsUrl(request?: Request): string {
  if (OVERRIDE_WS_URL) return stripTrailingSlash(OVERRIDE_WS_URL);

  if (request) {
    const forwardedProto =
      request.headers.get("x-forwarded-proto") ||
      request.headers.get("x-forwarded-protocol");
    const proto =
      forwardedProto ?? new URL(request.url).protocol.replace(":", "") ?? "http";
    const isSecure = proto === "https" || proto === "wss";
    const wsProto = isSecure ? "wss" : "ws";

    const forwardedHost =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    const hostname = forwardedHost
      ? forwardedHost.split(":")[0]
      : new URL(request.url).hostname;

    return `${wsProto}://${hostname}:${BACKEND_PORT}`;
  }

  if (typeof window !== "undefined") {
    const isSecure = window.location.protocol === "https:";
    const wsProto = isSecure ? "wss" : "ws";
    return `${wsProto}://${window.location.hostname}:${BACKEND_PORT}`;
  }

  return `ws://localhost:${BACKEND_PORT}`;
}
