import { apiFetch } from "~/lib/http.client";
import { ENDPOINTS } from "~/lib/endpoints";
import type { NoteRecord } from "~/types/storage";

export async function listNotes(): Promise<NoteRecord[]> {
  const res = await apiFetch(ENDPOINTS.notes.root);

  return res.ok ? res.json() : [];
}

export async function getNote(id: string): Promise<NoteRecord | null> {
  const res = await apiFetch(ENDPOINTS.notes.byId(id));

  return res.ok ? res.json() : null;
}

export async function createNote(
  fields: Partial<Pick<NoteRecord, "title" | "content" | "color" | "pinned">>,
): Promise<NoteRecord | null> {
  const res = await apiFetch(ENDPOINTS.notes.root, {
    method: "POST",
    body: JSON.stringify(fields),
  });

  return res.ok ? res.json() : null;
}

export async function updateNote(
  id: string,
  fields: Partial<Pick<NoteRecord, "title" | "content" | "color" | "pinned">>,
): Promise<NoteRecord | null> {
  const res = await apiFetch(ENDPOINTS.notes.byId(id), {
    method: "PATCH",
    body: JSON.stringify(fields),
  });

  return res.ok ? res.json() : null;
}

export async function toggleNotePin(
  note: NoteRecord,
): Promise<NoteRecord | null> {
  const endpoint = note.pinned
    ? `${ENDPOINTS.notes.byId(note.id)}/unpin`
    : `${ENDPOINTS.notes.byId(note.id)}/pin`;

  const res = await apiFetch(endpoint, {
    method: "POST",
  });

  return res.ok ? res.json() : null;
}

export async function deleteNote(id: string): Promise<boolean> {
  const res = await apiFetch(ENDPOINTS.notes.byId(id), {
    method: "DELETE",
  });

  return res.ok;
}
