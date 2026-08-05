// config.ts

export const BACKEND_PORT = Number(import.meta.env.VITE_API_PORT ?? 8000);

const API_OVERRIDE = import.meta.env.VITE_API_URL?.trim() ?? "";
const WS_OVERRIDE = import.meta.env.VITE_WS_URL?.trim() ?? "";

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

function buildOriginFromRequest(request: Request): string {
  const url = new URL(request.url);

  const proto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    url.host;

  return `${proto}://${host.split(":")[0]}:${BACKEND_PORT}`;
}

function buildOriginFromBrowser(): string {
  const url = new URL(window.location.href);

  url.port = String(BACKEND_PORT);
  url.pathname = "";
  url.search = "";
  url.hash = "";

  return url.origin;
}

export function getApiUrl(request?: Request): string {
  if (API_OVERRIDE) return stripTrailingSlash(API_OVERRIDE);

  if (request) return stripTrailingSlash(buildOriginFromRequest(request));

  if (typeof window !== "undefined") {
    return stripTrailingSlash(buildOriginFromBrowser());
  }

  return `http://localhost:${BACKEND_PORT}`;
}

export function getWsUrl(request?: Request): string {
  if (WS_OVERRIDE) return stripTrailingSlash(WS_OVERRIDE);

  return getApiUrl(request)
    .replace(/^https/, "wss")
    .replace(/^http/, "ws");
}
