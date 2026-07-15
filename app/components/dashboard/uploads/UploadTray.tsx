import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, RotateCcw, UploadCloud, X } from "lucide-react";
import React, { useState } from "react";
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

function formatEta(remainingBytes: number, speedBps: number): string {
  if (speedBps <= 0) return "…";
  const seconds = remainingBytes / speedBps;
  return seconds < 60
    ? `${Math.ceil(seconds)}s`
    : `${Math.ceil(seconds / 60)}m`;
}

const UploadTray = () => {
  const { uploads, cancelUpload, retryUpload, clearCompleted, totalActive } =
    useUploads();
  const [open, setOpen] = useState(false);

  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="mb-2 w-80 rounded-xl border border-black/5 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <span className="text-xs font-semibold">Uploads</span>
              <button
                onClick={clearCompleted}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Clear finished
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto">
              {uploads.map((u) => {
                const pct =
                  u.sizeBytes > 0
                    ? Math.min(100, (u.uploadedBytes / u.sizeBytes) * 100)
                    : 0;
                return (
                  <li
                    key={u.id}
                    className="px-3 py-2 border-b border-border/30 last:border-0"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium truncate">
                        {u.name}
                      </span>
                      {u.status === "uploading" && (
                        <button
                          onClick={() => cancelUpload(u.id)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <X size={12} />
                        </button>
                      )}
                      {u.status === "error" && (
                        <button
                          onClick={() => retryUpload(u.id)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                    <div className="h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          u.status === "error"
                            ? "bg-red-500"
                            : u.status === "done"
                              ? "bg-emerald-500"
                              : "bg-indigo-500",
                        )}
                        style={{ width: `${u.status === "done" ? 100 : pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                      <span>
                        {u.status === "error"
                          ? (u.error ?? "Failed")
                          : u.status === "done"
                            ? formatBytes(u.sizeBytes)
                            : u.status === "queued"
                              ? "Waiting…"
                              : `${formatBytes(u.uploadedBytes)} / ${formatBytes(u.sizeBytes)}`}
                      </span>
                      {u.status === "uploading" && (
                        <span>
                          {formatEta(u.sizeBytes - u.uploadedBytes, u.speedBps)}{" "}
                          left
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-black/5 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-lg text-xs font-medium"
      >
        <UploadCloud
          size={13}
          className={cn(
            totalActive > 0 && "text-indigo-600 dark:text-indigo-400",
          )}
        />
        {totalActive > 0 ? `Uploading ${totalActive}` : "Uploads"}
        <ChevronUp
          size={12}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
    </div>
  );
};

export default UploadTray;
