import { redirect } from "react-router";
import { getApiUrl } from "../config";
import { apiFetch } from "../http.server";

export async function requireUser(request: Request) {
  try {
    const res = await apiFetch(
      `${getApiUrl(request)}/api/auth/me`,
      { method: "GET" },
      request,
    );

    if (!res.ok) {
      throw redirect("/api/auth/login");
    }

    return res.json();
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    throw redirect("/api/auth/login");
  }
}

export async function redirectIfAuthenticated(request: Request) {
  try {
    const res = await apiFetch(`${getApiUrl(request)}/api/auth/me`, {}, request);

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
