import type { NoteRecord } from "~/types/storage";
import { apiFetch } from "../http.server";

export async function listNotes(request: Request): Promise<NoteRecord[]> {
  const res = await apiFetch("/api/notes", {}, request);
  if (!res.ok) {
    // optionally throw or return []
    return [];
  }
  return res.json();
}
