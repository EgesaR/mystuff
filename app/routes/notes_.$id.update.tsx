import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { updateNote } from "~/data/notes";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { id } = params;
  if (!id) {
    return json({ error: "Note ID is required" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const body = formData.get("body");
    if (!body || typeof body !== "string") {
      return json({ error: "Invalid note body" }, { status: 400 });
    }

    const updatedBody = JSON.parse(body);
    console.log("Server updating note:", { id, body: updatedBody });
    await updateNote(id, { body: updatedBody });
    return json({ ok: true });
  } catch (error) {
    console.error("Failed to update note:", error);
    return json(
      { error: `Failed to update note: ${error.message || error}` },
      { status: 500 }
    );
  }
};