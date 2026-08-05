import type { NoteMediaRecord } from "~/types/storage";
import { apiFetch } from "../http.client";
import { ENDPOINTS } from "../endpoint";

export async function uploadNoteImage(
  noteId: string,
  file: File,
): Promise<NoteMediaRecord | null> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(ENDPOINTS.notes.media(noteId), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return res.ok ? res.json() : null;
}
