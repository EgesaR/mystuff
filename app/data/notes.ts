import type { Note } from "~/types/notes";
import fs from "fs";
import path from "path";

const readNotes = (): Note[] =>
  JSON.parse(fs.readFileSync(path.resolve("app/data/notes.json"), "utf8"));

const writeNotes = (notes: Note[]) => {
  fs.writeFileSync(
    path.resolve("app/data/notes.json"),
    JSON.stringify(notes, null, 2)
  );
};

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
          ["list", "checkbox", "grid", "flexbox"].includes(item.type) &&
          Array.isArray(item.content) &&
          item.content.every((c: any) => typeof c === "string")
        ) {
          return true;
        }
        if (
          item.type === "image" &&
          typeof item.content === "object" &&
          typeof item.content.url === "string"
        ) {
          return true;
        }
        if (
          item.type === "table" &&
          typeof item.content === "object" &&
          Array.isArray(item.content.headers) &&
          item.content.headers.every((h: any) => typeof h === "string") &&
          Array.isArray(item.content.rows) &&
          item.content.rows.every((r: any) =>
            Array.isArray(r) && r.every((c: any) => typeof c === "string")
          )
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
let notes: Note[] = validateNotes(readNotes());

export const getNotes = async (): Promise<Note[]> => {
  return notes;
};

export const createNote = async (note: Note): Promise<Note> => {
  notes = [...notes, note];
  writeNotes(notes);
  return note;
};

export const deleteNote = async (id: string): Promise<Note[]> => {
  notes = notes.filter((note) => note.id !== id);
  writeNotes(notes);
  return notes;
};

export const updateNote = async (id: string, updatedNote: Partial<Note>): Promise<Note> => {
  const noteIndex = notes.findIndex((note) => note.id === id);
  if (noteIndex === -1) {
    throw new Error("Note not found");
  }
  notes[noteIndex] = {
    ...notes[noteIndex],
    ...updatedNote,
    updatedAt: new Date().toISOString(),
  };
  writeNotes(notes);
  return notes[noteIndex];
};