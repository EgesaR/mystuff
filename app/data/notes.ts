import { Note } from "~/types/notes";
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
  .filter(note => {
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
  .map(note => ({
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
   tags: note.tags.filter((tag: any) => typeof tag === "string")
  }));

 if (validNotes.length === 0) {
  console.warn("No valid notes found in notes.json");
 }

 return validNotes;
};

// In-memory notes store
let notes: Note[] = validateNotes(readNotes());

export const getNotes = async () => {
 return notes;
};

export const createNote = async (note: Note) => {
 notes = [...notes, note];
 writeNotes(notes);
 return note;
};

export const deleteNote = async (id: string) => {
 notes = notes.filter(note => note.id !== id);
 writeNotes(notes);
 console.log(notes.length);
 return notes;
};

export const updateNote = async (id: string, updatedNote: Partial<Note>) => {
 const noteIndex = notes.findIndex(note => note.id === id);
 if (noteIndex === -1) {
  throw new Error("Note not found");
 }
 notes[noteIndex] = {
  ...notes[noteIndex],
  ...updatedNote,
  updatedAt: new Date().toISOString()
 };
 writeNotes(notes);
 return notes[noteIndex];
};
