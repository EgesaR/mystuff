import { apiFetch } from "~/lib/http.client";
import type { CollectionRecord, FileRecord } from "~/types/storage";

export async function listCollections(): Promise<CollectionRecord[]> {
  try {
    const res = await apiFetch("/api/files/collections");
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

export async function createCollection(input: {
  name: string;
  color: string;
}): Promise<CollectionRecord | null> {
  try {
    const res = await apiFetch("/api/files/collections", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function renameCollection(
  id: string,
  name: string,
): Promise<CollectionRecord | null> {
  try {
    const res = await apiFetch(`/api/files/collections/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function deleteCollection(id: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/files/collections/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getCollectionFiles(id: string): Promise<FileRecord[]> {
  try {
    const res = await apiFetch(`/api/files/collections/${id}/files`);
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

export async function addFileToCollection(
  fileId: string,
  collectionId: string,
): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/files/collections/${collectionId}/files`, {
      method: "POST",
      body: JSON.stringify({ file_id: fileId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function removeFileFromCollection(
  fileId: string,
  collectionId: string,
): Promise<boolean> {
  try {
    const res = await apiFetch(
      `/api/files/collections/${collectionId}/files/${fileId}`,
      {
        method: "DELETE",
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function getCollectionsForFile(
  fileId: string,
): Promise<CollectionRecord[]> {
  try {
    const res = await apiFetch(`/api/files/collections/for-file/${fileId}`);
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}
