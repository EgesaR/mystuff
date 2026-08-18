import { useState, useRef, useEffect } from "react";
import { X, Folder, Layers } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
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

interface CreateItemModalProps {
  open: boolean;
  onClose: () => void;
  defaultType: "folder" | "collection";
  preselectedFiles?: { id: string; name: string; mime_type: string | null }[];
  onCreateFolder: (name: string, color: string) => void;
  onCreateCollection: (name: string, color: string) => void;
}

export function CreateItemModal({
  open,
  onClose,
  defaultType,
  preselectedFiles = [],
  onCreateFolder,
  onCreateCollection,
}: CreateItemModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<"folder" | "collection">(defaultType);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  useClickOutside(ref, onClose, open);

  // Sync state when modal re-opens
  useEffect(() => {
    if (open) {
      setType(defaultType);
      setName("");
      setColor(COLORS[0]);
    }
  }, [open, defaultType]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (type === "folder") onCreateFolder(name, color);
    else onCreateCollection(name, color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        ref={ref}
        className="relative w-full max-w-sm bg-card border border-border/50 rounded-2xl shadow-xl p-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold">Create New</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-1.5 mb-5 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
          <button
            onClick={() => setType("folder")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all",
              type === "folder"
                ? "bg-white dark:bg-neutral-800 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Folder size={14} /> Folder
          </button>
          <button
            onClick={() => setType("collection")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all",
              type === "collection"
                ? "bg-white dark:bg-neutral-800 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Layers size={14} /> Collection
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === "folder"
                  ? "e.g., Vacation Photos"
                  : "e.g., Q3 Invoices"
              }
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Color Label
            </label>
            <div className="flex items-center justify-between gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-6 rounded-full transition-all",
                    color === c
                      ? "scale-110 ring-2 ring-offset-2 ring-offset-card"
                      : "hover:scale-110 opacity-70 hover:opacity-100",
                  )}
                  style={{ backgroundColor: c, ringColor: c }}
                />
              ))}
            </div>
          </div>

          {preselectedFiles.length > 0 && (
            <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
              {preselectedFiles.length} file
              {preselectedFiles.length === 1 ? "" : "s"} will be automatically
              added to this {type}.
            </div>
          )}

          <Button type="submit" disabled={!name.trim()} className="w-full mt-2">
            Create {type === "folder" ? "Folder" : "Collection"}
          </Button>
        </form>
      </div>
    </div>
  );
}
