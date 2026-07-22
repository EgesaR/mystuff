import { useRef } from "react";
import { useClickOutside } from "~/hooks/useClickOutside";
import { cn } from "~/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ContextMenuItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  separatorBefore?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);

  // Basic boundary checks to prevent the menu from overflowing the screen
  const safeX = Math.min(
    x,
    typeof window !== "undefined" ? window.innerWidth - 200 : x,
  );
  const safeY = Math.min(
    y,
    typeof window !== "undefined" ? window.innerHeight - items.length * 40 : y,
  );

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        ref={ref}
        className="absolute z-50 w-48 bg-card border border-border/50 rounded-xl shadow-xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        style={{ top: safeY, left: safeX }}
      >
        {items.map((item, i) => (
          <div key={i}>
            {item.separatorBefore && (
              <div className="h-px bg-border/50 my-1 mx-2" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-left",
                item.danger
                  ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  : "text-foreground",
              )}
            >
              <item.icon
                size={14}
                className={
                  item.danger ? "text-red-600" : "text-muted-foreground"
                }
              />
              {item.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
