import { redirect } from "react-router";
import { apiFetch } from "../http.server";
import { ENDPOINTS } from "../endpoint";
import type { User } from "../types";

const { me: meUrl } = ENDPOINTS.auth;
export async function requireUser(request: Request) {
  try {
    const res = await apiFetch(meUrl, { method: "GET" }, request);

    if (!res.ok) {
      throw redirect("/auth/login");
    }

    const user: User = await res.json()
    const cookieHeader = request.headers.get("Cookie") || "";
    const token =
      cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("access_token="))
        ?.split("=")[1] ?? null;

    return { user, token };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    throw redirect("/auth/login");
  }
}

export async function redirectIfAuthenticated(request: Request) {
  try {
    const res = await apiFetch(
      meUrl,
      {},
      request,
    );

    if (res.ok) {
      throw redirect("/dashboard");
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
  }
  return null;
}
