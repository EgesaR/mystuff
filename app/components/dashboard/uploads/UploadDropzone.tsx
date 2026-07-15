import { FileIcon, UploadCloud, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useUploads } from "~/context/UploadContext";
import { cn } from "~/lib/utils";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / 1024 ** exp).toFixed(exp === 0 ? 0 : 1)} ${units[exp]}`;
}

const UploadDropzone = ({ folderId = null }: { folderId?: string | null }) => {
  const { enqueueFiles } = useUploads();
  const [pending, setPending] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalBytes = pending.reduce((sum, f) => sum + f.size, 0);
  const addFiles = (files: FileList | File[]) =>
    setPending((prev) => [...prev, ...Array.from(files)]);
  const removePending = (index: number) =>
    setPending((prev) => prev.filter((_, i) => i !== index));

  const startUploading = () => {
    if (pending.length === 0) return;
    enqueueFiles(pending, folderId);
    setPending([]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors",
          isDragging
            ? "border-indigo-500 bg-indigo-500/5"
            : "border-border hover:border-indigo-500/40 hover:bg-black/2 dark:hover:bg-white/2",
        )}
      >
        <UploadCloud size={22} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          Drag files here, or{" "}
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
            browse
          </span>
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {pending.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
            <span className="text-xs font-medium text-muted-foreground">
              {pending.length} file{pending.length > 1 ? "s" : ""} selectd.{" "}
              {formatBytes(totalBytes)} total
            </span>
            <Button
              size={"sm"}
              onClick={startUploading}
              className="h-7 rounded-lg text-xs"
            >
              Start upload
            </Button>
          </div>
          <ul className="max-h-40 overflow-y-auto">
            {pending.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-2.5 border-b border-border/30 px-4 py-2 text-sm last:border-0"
              >
                <FileIcon
                  size={14}
                  className="shrink-0 text-muted-foreground"
                />

                <span className="flex-1 truncate">{file.name}</span>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>

                <button
                  type="button"
                  onClick={() => removePending(index)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadDropzone;
