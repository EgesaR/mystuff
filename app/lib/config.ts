export const BACKEND_PORT = 8000;
export const isInProduction = process.env.NODE_ENV === "production";

export const API_URL = isInProduction
  ? "https://api.example.com"
  : `http://localhost:${BACKEND_PORT}`;

export const API_AUTH = `${API_URL}/api/auth`;

export const WS_URL = isInProduction
  ? "wss://api.example.com"
  : `ws://localhost:${BACKEND_PORT}`;
