export interface FolderRecord {
  id: string;
  name: string;
  color: string;
  parent_id: string | null;
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
