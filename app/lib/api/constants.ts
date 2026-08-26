export const API_PREFIX = "/api";

export const BACKEND_PORT = Number(import.meta.env.VITE_API_PORT ?? 8000);

const configuredApiUrl =
  import.meta.env.VITE_API_URL?.trim() ??
  process.env.VITE_API_URL ??
  "http://localhost:8000";

/**
 * Removes trailing slashes from the configured backend URL.
 */
export const API_ORIGIN = configuredApiUrl.replace(/\/+$/, "");

/**
 * Absolute API base URL used by server-side requests.
 *
 * Example:
 * http://localhost:8000/api
 */
export const API_BASE = `${API_ORIGIN}${API_PREFIX}`;

export const API_TIMEOUT = 30_000;
