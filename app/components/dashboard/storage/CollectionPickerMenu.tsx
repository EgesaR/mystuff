import { useRef } from "react";
import { useClickOutside } from "~/hooks/useClickOutside";
import { Plus, Check, Layers } from "lucide-react";
import { cn } from "~/lib/utils";

interface CollectionPickerMenuProps {
  x: number;
  y: number;
  collections: { id: string; name: string; color: string }[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export function CollectionPickerMenu({
  x,
  y,
  collections,
  selectedIds,
  onToggle,
  onCreateNew,
  onClose,
}: CollectionPickerMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);

  // Position adjustments
  const safeX = Math.min(
    x,
    typeof window !== "undefined" ? window.innerWidth - 240 : x,
  );
  const safeY = Math.min(
    y,
    typeof window !== "undefined" ? window.innerHeight - 300 : y,
  );

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        ref={ref}
        className="absolute z-50 w-56 max-h-80 flex flex-col bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        style={{ top: safeY, left: safeX }}
      >
        <div className="px-3 py-2.5 border-b border-border/50 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Add to Collection
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {collections.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No collections found.
            </div>
          ) : (
            collections.map((c) => {
              const isSelected = selectedIds.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(c.id);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-[13px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Layers
                      size={14}
                      style={{ color: c.color }}
                      className="shrink-0"
                    />
                    <span className="truncate">{c.name}</span>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-indigo-500 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="p-1.5 border-t border-border/50 bg-black/[0.02] dark:bg-white/[0.02]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateNew();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
          >
            <Plus size={13} /> Create New...
          </button>
        </div>
      </div>
    </div>
  );
}
