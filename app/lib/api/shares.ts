import { apiFetch } from "~/lib/http.client";
import type {
  ShareRecord,
  ShareResourceType,
  SharePermission,
} from "~/types/storage";

export async function createShare(input: {
  resource_type: ShareResourceType;
  resource_id: string;
  target_username: string;
  permission: SharePermission;
}): Promise<ShareRecord | null> {
  const res = await apiFetch("/api/shares", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.ok ? res.json() : null;
}

export async function acceptShare(token: string): Promise<ShareRecord | null> {
  const res = await apiFetch("/api/shares/accept", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  return res.ok ? res.json() : null;
}
