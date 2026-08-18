import { ENDPOINTS } from "~/lib/endpoints";
import { apiFetch } from "~/lib/http.client";

export async function logout() {
  await apiFetch(ENDPOINTS.auth.logout, {
    method: "POST",
    credentials: "include",
  });
}
