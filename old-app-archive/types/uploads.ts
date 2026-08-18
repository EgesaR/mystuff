// types/uploads.ts
export type UploadStatus =
  "queued" | "uploading" | "done" | "error" | "canceled";

export interface UploadItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  status: UploadStatus;
  uploadedBytes: number;
  speedBps: number;
  startedAt: number | null;
  error: string | null;
  folderId: string | null;
}
