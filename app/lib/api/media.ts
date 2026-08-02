import type { NoteMediaRecord } from "~/types/storage";
import { getApiUrl } from "../config";

export async function uploadNoteImage(
  noteId: string,
  file: File,
): Promise<NoteMediaRecord | null> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(
    `${getApiUrl() || ""}/api/notes/${noteId}/media`,
    {
      method: "POST",
      credentials: "include",
      body: fd,
    },
  );

  return res.ok ? res.json() : null;
}
