import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Layers, Plus } from "lucide-react";
import { useClickOutside } from "~/hooks/useClickOutside";

export interface CollectionOption {
  id: string;
  name: string;
  color: string;
}

interface CollectionPickerMenuProps {
  x: number;
  y: number;
  collections: CollectionOption[];
  selectedIds: Set<string>;
  onToggle: (collectionId: string) => void;
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
  const [pos, setPos] = useState({ x, y, ready: false });
  useClickOutside(ref, onClose);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    setPos({
      x: Math.max(pad, Math.min(x, window.innerWidth - rect.width - pad)),
      y: Math.max(pad, Math.min(y, window.innerHeight - rect.height - pad)),
      ready: true,
    });
  }, [x, y]);

  return createPortal(
    <div
      ref={ref}
      style={{ left: pos.x, top: pos.y, opacity: pos.ready ? 1 : 0 }}
      className="fixed z-[100] w-52 bg-card border border-border/50 rounded-xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
    >
      <p className="px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
        Add to collection
      </p>
      <div className="max-h-48 overflow-y-auto">
        {collections.length === 0 && (
          <p className="px-3 py-2 text-xs text-muted-foreground">
            No collections yet.
          </p>
        )}
        {collections.map((c) => {
          const active = selectedIds.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onToggle(c.id)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-left hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Layers size={13} style={{ color: c.color }} />
              <span className="flex-1 truncate">{c.name}</span>
              {active && (
                <Check size={13} className="text-indigo-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      <div className="my-1 h-px bg-border/50" />
      <button
        onClick={onCreateNew}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-left text-indigo-600 hover:bg-indigo-500/8"
      >
        <Plus size={13} /> New collection
      </button>
    </div>,
    document.body,
  );
}
