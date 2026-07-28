export const BACKEND_PORT = 8000;

export const API_URL =
  import.meta.env.VITE_API_URL ?? `http://localhost:${BACKEND_PORT}`;

export const API_AUTH = `${API_URL}/api/auth`;

export const WS_URL =
  import.meta.env.VITE_WS_URL ?? `ws://localhost:${BACKEND_PORT}/ws`;

console.log("ALL VITE ENV VARS:", import.meta.env);
console.log("SPECIFIC API URL:", import.meta.env.VITE_API_URL);
