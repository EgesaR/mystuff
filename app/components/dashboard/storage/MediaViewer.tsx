import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, ChevronLeft, ChevronRight, FileIcon } from "lucide-react";

interface ViewerFile {
  id: string;
  name: string;
  original_name: string;
  url: string;
  mime_type: string | null;
  size_bytes: number;
}

interface MediaViewerProps {
  files: ViewerFile[];
  initialIndex: number;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** exp).toFixed(exp === 0 ? 0 : 1)} ${units[exp]}`;
}

export function MediaViewer({
  files,
  initialIndex,
  onClose,
}: MediaViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const file = files[index];

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(files.length - 1, i + 1));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!file) return null;
  const isVideo = file.mime_type?.startsWith("video/");
  const isImage = file.mime_type?.startsWith("image/");
  const isAudio = file.mime_type?.startsWith("audio/");

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/92 backdrop-blur-md flex flex-col animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 shrink-0">
        <div className="min-w-0 flex items-center gap-2 text-white/85">
          <span className="text-sm font-medium truncate max-w-[50vw]">
            {file.name}
          </span>
          <span className="text-xs text-white/40 shrink-0">
            {formatBytes(file.size_bytes)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={file.url}
            download={file.original_name}
            className="size-9 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            title="Download"
          >
            <Download size={17} />
          </a>
          <button
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            title="Close"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        className="flex-1 relative flex items-center justify-center px-4 sm:px-20 pb-6 min-h-0"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {index > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="max-h-full max-w-full flex items-center justify-center">
          {isVideo ? (
            <video
              key={file.id}
              src={file.url}
              controls
              autoPlay
              className="max-h-[80vh] max-w-full rounded-lg shadow-2xl"
            />
          ) : isImage ? (
            <img
              key={file.id}
              src={file.url}
              alt={file.name}
              className="max-h-[80vh] max-w-full rounded-lg shadow-2xl object-contain"
            />
          ) : isAudio ? (
            <div className="flex flex-col items-center gap-6 bg-white/5 border border-white/10 rounded-2xl px-10 py-8 min-w-[320px]">
              <div className="size-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <FileIcon size={28} className="text-indigo-300" />
              </div>
              <audio
                key={file.id}
                src={file.url}
                controls
                autoPlay
                className="w-full"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/60">
              <FileIcon size={48} />
              <p className="text-sm">
                Preview isn't available for this file type.
              </p>
              <a
                href={file.url}
                download={file.original_name}
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Download instead
              </a>
            </div>
          )}
        </div>

        {index < files.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {files.length > 1 && (
        <div className="text-center text-xs text-white/40 pb-4 shrink-0">
          {index + 1} / {files.length}
        </div>
      )}
    </div>,
    document.body,
  );
}
