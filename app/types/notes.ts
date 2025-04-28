export interface Owner {
  id: string;
  name: string;
  avatar: string;
}

export interface TextNoteBody {
  type: "heading" | "subheading" | "paragraph" | "code";
  content: string;
}

export interface ListNoteBody {
  type: "list";
  content: string[];
}

export type NoteBody = TextNoteBody | ListNoteBody;

export interface Note {
  id: string;
  title: string;
  body: NoteBody[];
  updatedAt: string;
  createdAt: string;
  owners: Owner[];
  tags: string[];
}
