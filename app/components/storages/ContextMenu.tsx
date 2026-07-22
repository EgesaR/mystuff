import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { useClickOutside } from "~/hooks/useClickOutside";
import { cn } from "~/lib/utils";

export interface ContextMenuItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Draws a divider line above this item */
  separatorBefore?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y, ready: false });

  useClickOutside(ref, onClose);

  // Also close on scroll (a stuck menu drifting away from its anchor
  // looks broken) — covers the original "won't disappear" complaint too.
  useLayoutEffect(() => {
    function handleScroll() {
      onClose();
    }
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [onClose]);

  // Clamp inside the viewport so a menu opened near an edge doesn't overflow.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    const nx = Math.min(x, window.innerWidth - rect.width - pad);
    const ny = Math.min(y, window.innerHeight - rect.height - pad);
    setPos({ x: Math.max(pad, nx), y: Math.max(pad, ny), ready: true });
  }, [x, y]);

  return createPortal(
    <div
      ref={ref}
      style={{ left: pos.x, top: pos.y, opacity: pos.ready ? 1 : 0 }}
      className="fixed z-[100] w-48 bg-card border border-border/50 rounded-xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => (
        <div key={item.label}>
          {item.separatorBefore && i > 0 && (
            <div className="my-1 h-px bg-border/50" />
          )}
          <button
            onClick={() => {
              if (item.disabled) return;
              item.onClick();
              onClose();
            }}
            disabled={item.disabled}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
              item.danger
                ? "text-red-600 hover:bg-red-500/8"
                : "text-foreground hover:bg-black/5 dark:hover:bg-white/5",
            )}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
