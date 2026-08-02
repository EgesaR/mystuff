import { getApiUrl } from "~/lib/config";

export async function logout() {
  await fetch(`${getApiUrl()}/logout`, {
    method: "POST",
    credentials: "include",
  });
}
