import { BACKEND_PORT } from "./constants";

/**
 * Removes trailing slashes from a URL/path.
 *
 * Examples:
 * "/api/"       -> "/api"
 * "/api///"     -> "/api"
 * "https://x/"  -> "https://x"
 */
export const stripTrailingSlash = (value: string): string =>
  value.replace(/\/+$/, "");

/**
 * Normalizes an API path.
 *
 * Examples:
 * "notes"        -> "/notes"
 * "/notes"       -> "/notes"
 * "/notes/"      -> "/notes"
 * "/api/notes/"  -> "/api/notes"
 */
export const normalizedPath = (path: string): string => {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  return stripTrailingSlash(normalized);
};

/**
 * Builds the backend origin from an incoming server request.
 *
 * Example:
 * https://example.com + backend port 8000
 * -> http(s)://example.com:8000
 */
export function buildOriginFromRequest(request: Request): string {
  const url = new URL(request.url);

  const protocol =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");

  const forwardedHost = request.headers.get("x-forwarded-host");

  const hostname = forwardedHost ?? request.headers.get("host") ?? url.hostname;

  return `${protocol}://${hostname.split(":")[0]}:${BACKEND_PORT}`;
}
