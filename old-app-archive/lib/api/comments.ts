import type { CommentRecord } from "~/types/storage";
import { apiFetch } from "../http.client";

export async function listComments(noteId: string): Promise<CommentRecord[]> {
  const res = await apiFetch(`/api/notes/${noteId}/comments`);

  return res.ok ? res.json() : [];
}

export async function createComment(
  noteId: string,
  body: string,
): Promise<CommentRecord | null> {
  const res = await apiFetch(`/api/notes/${noteId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });

  return res.ok ? res.json() : null;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const res = await apiFetch(`/api/notes/comments/${commentId}`, {
    method: "DELETE",
  });
  return res.ok;
}
