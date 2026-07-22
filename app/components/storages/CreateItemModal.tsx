import { useEffect, useRef, useState } from "react";
import {
  Folder,
  Layers,
  File as FileIcon,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useClickOutside } from "~/hooks/useClickOutside";

const COLORS = [
  "#6366f1",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
  "#64748b",
];

export interface MergePreviewFile {
  id: string;
  name: string;
  mime_type: string | null;
}

interface CreateItemModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: "folder" | "collection";
  /** Set when triggered by dragging one item onto another to bundle them */
  preselectedFiles?: MergePreviewFile[];
  onCreateFolder: (name: string, color: string) => Promise<void> | void;
  onCreateCollection: (name: string, color: string) => Promise<void> | void;
}

export function CreateItemModal({
  open,
  onClose,
  defaultType = "folder",
  preselectedFiles,
  onCreateFolder,
  onCreateCollection,
}: CreateItemModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<"folder" | "collection">(defaultType);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  useClickOutside(ref, onClose, open);

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setName(
        preselectedFiles && preselectedFiles.length > 0
          ? `${preselectedFiles.length} items`
          : "",
      );
      setColor(COLORS[0]);
    }
  }, [open, defaultType, preselectedFiles]);

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      if (type === "folder") await onCreateFolder(name.trim(), color);
      else await onCreateCollection(name.trim(), color);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        ref={ref}
        className="relative w-full max-w-sm bg-card border border-border/50 rounded-2xl shadow-xl p-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <h3 className="text-sm font-semibold mb-4">
          {preselectedFiles?.length ? "Group these items" : "Create new"}
        </h3>

        {/* Type toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-black/5 dark:bg-white/5 p-1 mb-4">
          <button
            onClick={() => setType("folder")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium transition-colors",
              type === "folder"
                ? "bg-white dark:bg-neutral-800 shadow-sm"
                : "text-muted-foreground",
            )}
          >
            <Folder size={13} /> Folder
          </button>
          <button
            onClick={() => setType("collection")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium transition-colors",
              type === "collection"
                ? "bg-white dark:bg-neutral-800 shadow-sm"
                : "text-muted-foreground",
            )}
          >
            <Layers size={13} /> Collection
          </button>
        </div>

        {preselectedFiles && preselectedFiles.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 -mt-1">
            {preselectedFiles.slice(0, 5).map((f) => (
              <div
                key={f.id}
                title={f.name}
                className="size-7 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0"
              >
                {f.mime_type?.startsWith("image/") ? (
                  <ImageIcon size={12} className="text-muted-foreground" />
                ) : (
                  <FileIcon size={12} className="text-muted-foreground" />
                )}
              </div>
            ))}
            {preselectedFiles.length > 5 && (
              <span className="text-[11px] text-muted-foreground pl-1">
                +{preselectedFiles.length - 5} more
              </span>
            )}
          </div>
        )}

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder={type === "folder" ? "Folder name" : "Collection name"}
          className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 mb-3"
        />

        <div className="flex items-center gap-1.5 mb-4">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "size-6 rounded-full border-2 transition-transform",
                color === c
                  ? "border-foreground scale-110"
                  : "border-transparent",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <Button
          onClick={handleCreate}
          className="w-full rounded-lg"
          disabled={!name.trim() || saving}
        >
          {saving
            ? "Creating…"
            : type === "folder"
              ? "Create Folder"
              : "Create Collection"}
        </Button>
      </div>
    </div>
  );
}
