export interface FolderRecord {
  id: string;
  name: string;
  color: string;
  parent_id: string | null;
  children: FolderRecord[];
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  name: string;
  original_name: string;
  file_path: string;
  url: string;
  mime_type: string | null;
  size_bytes: number;
  media_type: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionRecord {
  id: string;
  name: string;
  color: string;
  file_count?: number;
  created_at: string;
  updated_at: string;
}

export interface NoteContent {
  text: string;
}

export interface NoteRecord {
  id: string;
  title: string;
  content: NoteContent | null;
  plain_text: string | null;
  color: string;
  pinned: boolean;
  media: unknown[];
  created_at: string;
  updated_at: string;
}

export type ShareResourceType = "note" | "file" | "folder" | "collection";
export type SharePermission = "view" | "edit";
export type ShareStatus = "pending" | "accepted" | "revoked";

export interface ShareRecord {
  id: string;
  resource_type: ShareResourceType;
  resource_id: string;
  owner_id: string;
  target_user_id: string | null;
  permission: SharePermission;
  status: ShareStatus;
  token: string;
  created_at: string;
  updated_at: string;
}

export interface NoteMediaRecord {
  id: string;
  url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommentRecord {
  id: string;
  note_id: string;
  author_id: string;
  author_username: string;
  body: string;
  created_at: string;
  updated_at: string;
}