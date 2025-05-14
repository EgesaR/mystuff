import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { deleteNote } from "~/data/notes";

export const action = async ({ params }: ActionFunctionArgs) => {
 const { id } = params;
 if (!id) {
  return json({ error: "Note ID is required" }, { status: 400 });
 }

 try {
  console.log(`Deleting note with ID: ${id}`);
  const results = await deleteNote(id);
  return json({ ok: true, notes: results});
 } catch (error) {
  console.error("Failed to delete note:", error);
  return json(
   { error: `Failed to delete note: ${error.message || String(error)}` },
   { status: 500 }
  );
 }
};
