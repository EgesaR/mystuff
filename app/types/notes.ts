export interface Item {
  id: string;
  value: string;
}

export interface Owner {
  id: string;
  name: string;
  avatar: string;
}

export interface Note {
  id: string;
  title: string;
  body: NoteBody[];
  updatedAt: string;
  createdAt: string;
  owners: Owner[];
  tags: string[];
}

export type NoteBody =
  | { type: "heading" | "subheading" | "paragraph" | "code"; content: string }
  | { type: "list" | "checkbox" | "grid" | "flexbox"; content: string[] }
  | { type: "image"; content: { url: string; caption?: string } }
  | { type: "table"; content: { headers: string[]; rows: string[][] } };

export interface ActionData {
  error?: string;
}