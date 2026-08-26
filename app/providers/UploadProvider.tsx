import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import type { UploadItem } from "~/types/uploads";

const MAX_CONCURRENT_UPLOADS = 3;
const UPLOAD_ENDPOINT = "/api/files/upload";

interface UploadContextValue {
  uploads: UploadItem[];
  enqueueFiles: (files: File[], folderId?: string | null) => void;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  clearCompleted: () => void;
  totalActive: number;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export const UploadProvider = ({ children }: { children: ReactNode }) => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const xhrMap = useRef<Map<string, XMLHttpRequest>>(new Map());
  const activeCountRef = useRef(0);
  const queueRef = useRef<string[]>([]);
  const uploadRef = useRef<UploadItem[]>([]);
  uploadRef.current = uploads;

  const patchUpload = useCallback((id: string, patch: Partial<UploadItem>) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );
  }, []);

  const runNext = useCallback(() => {
    while (
      activeCountRef.current < MAX_CONCURRENT_UPLOADS &&
      queueRef.current.length > 0
    ) {
      const id = queueRef.current.shift();
      const item = uploadRef.current.find((u) => u.id === id);
      if (!item || item.status !== "queued") continue;
      startUpload(item);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishSlot = useCallback(() => {
    activeCountRef.current = Math.max(0, activeCountRef.current - 1);
    runNext();
  }, [runNext]);

  const startUpload = useCallback(
    (item: UploadItem) => {
      activeCountRef.current += 1;
      patchUpload(item.id, { status: "uploading", startedAt: Date.now() });

      const xhr = new XMLHttpRequest();
      xhrMap.current.set(item.id, xhr);

      const form = new FormData();
      form.append("file", item.file);
      if (item.folderId) form.append("folder_id", item.folderId);

      let lastLoaded = 0;
      let lastTime = Date.now();

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const now = Date.now();
        const elapsed = (now - lastTime) / 1000;
        const speedBps = elapsed > 0 ? (e.loaded - lastLoaded) / elapsed : 0;
        lastLoaded = e.loaded;
        lastTime = now;
        patchUpload(item.id, { uploadedBytes: e.loaded, speedBps });
      };

      xhr.onload = () => {
        xhrMap.current.delete(item.id);
        if (xhr.status >= 200 && xhr.status < 300) {
          patchUpload(item.id, {
            status: "done",
            uploadedBytes: item.sizeBytes,
            speedBps: 0,
          });
        } else {
          let message = `Upload failed (${xhr.status})`;
          try {
            message = JSON.parse(xhr.responseText)?.detail ?? message;
          } catch {
            // non-JSON error body - keep the generic message
          }
          patchUpload(item.id, {
            status: "error",
            error: message,
            speedBps: 0,
          });
        }
        finishSlot();
      };

      xhr.onabort = () => {
        xhrMap.current.delete(item.id);
        patchUpload(item.id, { status: "canceled", speedBps: 0 });
        finishSlot();
      };

      xhr.open("POST", UPLOAD_ENDPOINT);
      xhr.withCredentials = true; // send your auth cookie automatically
      xhr.send(form);
    },
    [patchUpload, finishSlot],
  );

  const enqueueFiles = useCallback(
    (files: File[], folderId: string | null = null) => {
      const newItems: UploadItem[] = files.map((file) => ({
        id: uuidv4(),
        file,
        name: file.name,
        sizeBytes: file.size,
        status: "queued",
        uploadedBytes: 0,
        speedBps: 0,
        startedAt: null,
        error: null,
        folderId,
      }));

      setUploads((prev) => [...prev, ...newItems]);
      queueRef.current.push(...newItems.map((i) => i.id));
      requestAnimationFrame(runNext); // let state settle before draining the queue
    },
    [runNext],
  );

  const cancelUpload = useCallback(
    (id: string) => {
      const xhr = xhrMap.current.get(id);
      if (xhr) {
        xhr.abort();
        return;
      }
      queueRef.current = queueRef.current.filter((qid) => qid !== id);
      patchUpload(id, { status: "canceled" });
    },
    [patchUpload],
  );

  const retryUpload = useCallback(
    (id: string) => {
      patchUpload(id, { status: "queued", uploadedBytes: 0, error: null });
      queueRef.current.push(id);
      runNext();
    },
    [patchUpload, runNext],
  );

  const clearCompleted = useCallback(() => {
    setUploads((prev) =>
      prev.filter((u) => u.status !== "done" && u.status !== "canceled"),
    );
  }, []);

  const value: UploadContextValue = {
    uploads,
    enqueueFiles,
    cancelUpload,
    retryUpload,
    clearCompleted,
    totalActive: uploads.filter(
      (u) => u.status === "queued" || u.status === "uploading",
    ).length,
  };

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
};

export const useUploads = () => {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUploads must be used within an UploadProvider");
  return ctx;
};
