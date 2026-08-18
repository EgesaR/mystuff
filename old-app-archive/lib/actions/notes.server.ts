// lib/actions/notes.server.ts  (or lib/loaders/notes.server.ts)
import { apiFetch } from "~/lib/http.server";
import type { NoteRecord } from "~/types/storage";

export async function createNote(
  request: Request,
  fields: {
    title?: string;
    content?: string;
    color?: string;
    pinned?: boolean;
  } = {},
) {
  const res = await apiFetch(
    "/api/notes",
    {
      method: "POST",
      body: JSON.stringify(fields),
    },
    request,
  );
  return res.ok ? res.json() : null;
}

export async function updateNote(
  request: Request,
  id: string,
  fields: Partial<Pick<NoteRecord, "title" | "content" | "color" | "pinned">>,
) {
  const res = await apiFetch(
    `/api/notes/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(fields),
    },
    request,
  );
  return res.ok ? res.json() : null;
}

export async function deleteNote(request: Request, id: string) {
  const res = await apiFetch(`/api/notes/${id}`, { method: "DELETE" }, request);
  return res.ok;
}
