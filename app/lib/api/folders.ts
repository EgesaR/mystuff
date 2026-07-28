import { apiFetch } from "~/lib/http.client";
import type { FolderRecord } from "~/types/storage";

export async function listFolders(
  parentId: string | null,
): Promise<FolderRecord[]> {
  const qs = parentId ? `?parent_id=${parentId}` : "";
  const res = await apiFetch(`/api/files/folders${qs}`);
  return res.ok ? res.json() : [];
}

export async function createFolder(input: {
  name: string;
  color: string;
  parent_id: string | null;
}): Promise<FolderRecord | null> {
  const res = await apiFetch("/api/files/folders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.ok ? res.json() : null;
}

export async function renameFolder(
  id: string,
  name: string,
): Promise<FolderRecord | null> {
  const res = await apiFetch(`/api/files/folders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
  return res.ok ? res.json() : null;
}

export async function deleteFolder(id: string): Promise<boolean> {
  const res = await apiFetch(`/api/files/folders/${id}`, { method: "DELETE" });
  return res.ok;
}
