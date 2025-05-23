import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { v4 as uuid } from "uuid";
import { createNote } from "~/data/notes";
import type { Note, Item, ActionData } from "~/types/notes";

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const tags = JSON.parse(formData.get("tags") as string) as Item[];
  const owners = JSON.parse(formData.get("owners") as string) as Item[];

  if (!title) {
    return json<ActionData>({ error: "Title is required" }, { status: 400 });
  }

  const note: Note = {
    id: uuid(),
    title,
    body: [
      {
        type: "paragraph",
        content: "Begin from here",
      },
    ],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    owners: owners.map((owner) => ({
      id: uuid(),
      name: owner.value,
      avatar: "https://placecats.com/200/200",
    })),
    tags: tags.map((tag) => tag.value),
  };

  try {
    const createdNote = await createNote(note);
    return json({ note: createdNote });
  } catch (error) {
    return json<ActionData>({ error: "Failed to create note" }, { status: 500 });
  }
};