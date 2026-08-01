import { apiFetch } from "~/lib/http.client";
import type { NoteRecord } from "~/types/storage";

export async function getNote(id: string): Promise<NoteRecord | null> {
  const res = await apiFetch(`/api/notes/${id}`);
  return res.ok ? res.json() : null;
}

export async function updateNote(
  id: string,
  fields: Partial<Pick<NoteRecord, "title" | "content" | "color" | "pinned">>,
): Promise<NoteRecord | null> {
  const res = await apiFetch(`/api/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
  return res.ok ? res.json() : null;
}

export async function deleteNote(id: string): Promise<boolean> {
  const res = await apiFetch(`/api/notes/${id}`, { method: "DELETE" });
  return res.ok;
}
