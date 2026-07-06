import { redirect } from "react-router";
import { API_AUTH } from "../config";
import { apiFetch } from "../http.server";

export async function requireUser(request: Request) {
  const res = await apiFetch(`${API_AUTH}/me`, { method: "GET" }, request);

  if (!res.ok) {
    throw redirect("/auth/login");
  }

  return res.json();
}

export async function redirectIfAuthenticated(request: Request) {
  const res = await apiFetch(`${API_AUTH}/me`, {}, request);

  if (res.ok) {
    throw redirect("/dashboard");
  }

  return null;
}
