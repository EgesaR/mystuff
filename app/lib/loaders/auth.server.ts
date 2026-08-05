import { redirect } from "react-router";
import { apiFetch } from "../http.server";
import { ENDPOINTS } from "../endpoint";

const { me: meUrl } = ENDPOINTS.auth;
export async function requireUser(request: Request) {
  try {
    const res = await apiFetch(meUrl, { method: "GET" }, request);

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
