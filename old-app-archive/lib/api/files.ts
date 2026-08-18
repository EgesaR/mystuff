import { apiFetch } from "~/lib/http.client";
import type { FileRecord } from "~/types/storage";

export async function listFiles(): Promise<FileRecord[]> {
  const res = await apiFetch("/api/files");
  return res.ok ? res.json() : [];
}

export async function renameFile(id: string, name: string): Promise<boolean> {
  const res = await apiFetch(`/api/files/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
  return res.ok;
}

export async function deleteFile(id: string): Promise<boolean> {
  const res = await apiFetch(`/api/files/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function moveFile(
  id: string,
  targetFolderId: string | null,
): Promise<boolean> {
  const qs = targetFolderId ? `?folder_id=${targetFolderId}` : "";
  const res = await apiFetch(`/api/files/${id}/move${qs}`, { method: "PATCH" });
  return res.ok;
}
