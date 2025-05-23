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

// In-memory cache, updated after reads and writes
let notes: Note[] = validateNotes(readNotes());

export const getNotes = async (): Promise<Note[]> => {
  // Always read from notes.json to ensure freshness
  notes = validateNotes(readNotes());
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

export const getTagSuggestions = async (query: string): Promise<string[]> => {
  // Ensure notes is fresh
  notes = validateNotes(readNotes());
  const allTags = notes.flatMap((note) => note.tags);
  const uniqueTags = [...new Set(allTags)];
  if (!query.trim()) return uniqueTags;
  return uniqueTags.filter((tag) =>
    tag.toLowerCase().includes(query.toLowerCase())
  );
};

export const getOwnerSuggestions = async (query: string): Promise<string[]> => {
  // Ensure notes is fresh
  notes = validateNotes(readNotes());
  const allOwners = notes.flatMap((note) => note.owners.map((owner) => owner.name));
  const uniqueOwners = [...new Set(allOwners)];
  if (!query.trim()) return uniqueOwners;
  return uniqueOwners.filter((owner) =>
    owner.toLowerCase().includes(query.toLowerCase())
  );
};