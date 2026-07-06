import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useTabs } from "~/context/TabContext";
import { getIslandColorStyles } from "~/types/tabs";
import { cn } from "~/lib/utils";
import { type Tab, type TabIsland as TabIslandType } from "~/types/tabs";
import { FaSpinner } from "react-icons/fa";
import { Pin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { createPortal } from "react-dom";

interface HorizontalTabItemProps {
  tab: Tab;
  island?: TabIslandType;
  isOverlay?: boolean;
  hoveredByTabId?: string | null;
  hoverProgress?: number;
  showGroupTooltip?: boolean;
  groupSourceTab?: Tab | null;
  index?: number;
}

const HorizontalTabItem = ({
  tab,
  island,
  isOverlay = false,
  hoveredByTabId,
  hoverProgress = 0,
  showGroupTooltip = false,
  groupSourceTab,
  index = 0,
}: HorizontalTabItemProps) => {
  const { setActiveTab, deleteTab } = useTabs();
  const [showClose, setShowClose] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const wasActive = useRef(tab.isActive);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tab.id,
    data: { type: "Tab", tab },
    disabled: isOverlay,
  });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      itemRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  useEffect(() => {
    if (tab.isActive && !wasActive.current && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    wasActive.current = tab.isActive;
  }, [tab.isActive]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition ?? "transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={cn(
        "relative shrink-0 group/tab flex",
        isDragging && "opacity-30 z-0",
      )}
      onMouseEnter={() => setShowClose(true)}
      onMouseLeave={() => setShowClose(false)}
    >
      {/* Pop-in entry animation for new tabs */}
      <motion.div
        initial={isOverlay ? false : { opacity: 0, y: 15,  }}
        animate={{ opacity: 1, y: 0, }}
        transition={{
          duration: 0.72,
          ease: [0.23, 1, 0.32, 1], // Ultra-smooth Apple-like easing
          delay: isOverlay ? 0 : index * 0.06, // 40ms stagger per tab
        }}
        className="flex w-full h-full"
      >
        {/*Hover progress ring for grouping*/}
        {hoveredByTabId && hoverProgress > 0 && (
          <div className="absolute inset-0 rounded-lg pointer-events-none">
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ transform: "rotate(-90deg)" }}
            >
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="6"
                ry="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary/60"
                strokeDasharray={`${hoverProgress * 200} 200`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Tab button */}
        <button
          {...attributes}
          {...listeners}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-md",
            "text-sm font-medium cursor-pointer select-none",
            "transition-all duration-150 ease-out border border-transparent",
            tab.isActive
              ? "bg-white text-foreground shadow-sm hover:bg-white/90 dark:bg-background dark:hover:bg-background/80"
              : // 👇 This is the updated hover state for inactive tabs!
                "text-muted-foreground hover:text-foreground hover:bg-neutral-500/15 dark:hover:bg-white/10",
            isOverlay &&
              "opacity-90 shadow-2xl scale-105 rotate-1 border-border bg-background",
            tab.isPinned && "px-2",
            isDragging && "cursor-grabbing",
          )}
          style={{ minWidth: tab.isPinned ? 36 : 100, maxWidth: 200 }}
        >
          {tab.icon && (
            <span
              className={cn(
                "shrink-0",
                tab.isActive ? "opacity-100" : "opacity-60",
              )}
            >
              <TabIcon icon={tab.icon} size={13} />
            </span>
          )}

          {!tab.isPinned && (
            <span className="truncate text-[13px] font-medium flex-1 text-left">
              {tab.title}
            </span>
          )}

          {tab.status === "loading" && (
            <FaSpinner
              className="size-3 animate-spin text-muted-foreground"
              size={12}
            />
          )}

          {!tab.isPinned ? (
            <AnimatePresence>
              {(showClose || isOverlay) && (
                <motion.button
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: 16, opacity: 1, marginLeft: 4 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTab(tab.id);
                  }}
                  className="shrink-0 h-4 overflow-hidden rounded-full flex items-center justify-center hover:bg-muted-foreground/20 transition-colors duration-150 ease-out"
                >
                  <X className="size-3 shrink-0 text-muted-foreground hover:text-foreground" />
                </motion.button>
              )}
            </AnimatePresence>
          ) : (
            <Pin size={12} className="shrink-0 text-muted-foreground/50 ml-1" />
          )}
        </button>
      </motion.div>

      <AnimatePresence>
        {showGroupTooltip && groupSourceTab && (
          <GroupTooltip
            sourceTab={groupSourceTab}
            targetTab={tab}
            anchorRef={itemRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TabIcon = ({ icon, size = 24 }: { icon: Tab["icon"]; size?: number }) => {
  if (icon.type === "lucide") {
    const LIcon = (LucideIcons as any)[icon.name];
    return LIcon ? <LIcon size={size} /> : <LucideIcons.File size={size} />;
  }
  return <LucideIcons.File size={size} />;
};

const GroupTooltip = ({
  sourceTab,
  targetTab,
  anchorRef,
}: {
  sourceTab: Tab;
  targetTab: Tab;
  anchorRef: RefObject<HTMLDivElement | null>;
}) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    let frameId: number;

    const update = () => {
      const el = anchorRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        setPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
      }
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [anchorRef]);

  if (!pos || typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="fixed z-999 -translate-x-1/2 pointer-events-none"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="bg-popover border border-border rounded-lg shadow-xl px-3 py-2 whitespace-nowrap">
        <p className="text-xs text-muted-foreground">
          Release to group{" "}
          <span className="font-semibold text-foreground">
            "{sourceTab.title}"
          </span>{" "}
          with{" "}
          <span className="font-semibold text-foreground">
            "{targetTab.title}"
          </span>
        </p>
      </div>
    </motion.div>,
    document.body,
  );
};
export default HorizontalTabItem;
