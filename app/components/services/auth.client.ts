import { API_AUTH } from "~/lib/config";

export async function logout() {
  await fetch(`${API_AUTH}/logout`, {
    method: "POST",
    credentials: "include",
  });
}
