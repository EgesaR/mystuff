import { Note } from "~/types/notes";
import notesData from "./notes.json";

// Validate JSON data to ensure it matches Note type
const validateNotes = (data: any[]): Note[] => {
  const validNotes: Note[] = data
    .filter((note) => {
      if (
        !note.id ||
        !note.title ||
        !Array.isArray(note.body) ||
        !note.updatedAt ||
        !note.createdAt ||
        !Array.isArray(note.owners) ||
        !Array.isArray(note.tags)
      ) {
        console.warn("Invalid note structure:", note);
        return false;
      }
      return true;
    })
    .map((note) => ({
      ...note,
      body: note.body.filter((item: any) => {
        if (
          ["heading", "subheading", "paragraph", "code"].includes(item.type) &&
          typeof item.content === "string"
        ) {
          return true;
        }
        if (
          item.type === "list" &&
          Array.isArray(item.content) &&
          item.content.every((c: any) => typeof c === "string")
        ) {
          return true;
        }
        console.warn("Invalid body item:", item);
        return false;
      }) as Note["body"],
      owners: note.owners.filter(
        (owner: any) => owner.id && owner.name && owner.avatar
      ),
      tags: note.tags.filter((tag: any) => typeof tag === "string"),
    }));

  if (validNotes.length === 0) {
    console.warn("No valid notes found in notes.json");
  }

  return validNotes;
};

// In-memory notes store
let notes: Note[] = validateNotes(notesData);

export const getNotes = async () => {
  console.log("Getting notes");
  console.log("Got all notes");
  return notes;
};

export const createNote = async (note: Note) => {
  notes = [...notes, note];
  return note;
};