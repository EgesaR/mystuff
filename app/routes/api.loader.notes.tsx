import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getNotes } from "~/data/notes";
import type { Note } from "~/types/notes";

export const loader: LoaderFunction = async () => {
  try {
    const notes = await getNotes();
    return json({ notes });
  } catch (error) {
    return json({ error: "Failed to fetch notes" }, { status: 500 });
  }
};