// components/dashboard/tabs/TabIsland.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "~/components/ui/card";
import {
  getIslandColorStyles,
  type Tab,
  type TabIsland as TabIslandType,
} from "~/types/tabs";
import {
  ISLAND_DROP_PREFIX,
  type HoverState,
  type PendingGroup,
} from "./constants";
import { useTabs } from "~/context/TabContext";
import { useDroppable } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { cn } from "~/lib/utils";
import HorizontalTabItem from "./HorizontalTabItem";
import { Unlink } from "lucide-react";

interface TabIslandProps {
  island: TabIslandType;
  islandTabs: Tab[];
  allTabs: Tab[];
  pendingGroup: PendingGroup | null;
  hoverState: HoverState | null;
}

const INDICATOR_SIZE = 16;

const TabIsland = ({
  island,
  islandTabs,
  allTabs,
  pendingGroup,
  hoverState,
}: TabIslandProps) => {
  const { updateIsland, toggleIslandCollapse, deleteIsland } = useTabs();
  const [isOpen, setIsOpen] = useState(!island.isCollapsed);
  const [isHoveringLabel, setIsHoveringLabel] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(island.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // See note above: measure real width instead of animating to "auto".
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setContentWidth(entry.contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const colorStyles = getIslandColorStyles(island.color);
  const isEmpty = islandTabs.length === 0;

  const { setNodeRef, isOver } = useDroppable({
    id: `${ISLAND_DROP_PREFIX}${island.id}`,
    data: { type: "Island", islandId: island.id },
  });

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const handleRename = () => {
    if (name.trim() && name !== island.name) {
      updateIsland(island.id, { name: name.trim() });
    }
    setEditing(false);
  };

  const toggle = () => {
    setIsOpen((prev) => !prev);
    toggleIslandCollapse(island.id);
  };

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "h-10 overflow-hidden rounded-lg p-0 shadow-sm shrink-0 border transition-shadow bg-white/80 dark:bg-neutral-900/60 backdrop-blur-sm",
        isOver
          ? "ring-2 ring-indigo-500/40 ring-offset-1 border-indigo-500/30"
          : "border-black/5 dark:border-white/10",
      )}
    >
      <CardContent className="flex h-full items-center p-1.5">
        <motion.div
          className={cn(
            "grid shrink-0 cursor-pointer place-items-center",
            colorStyles.dot,
          )}
          animate={
            isOpen
              ? {
                  width: INDICATOR_SIZE,
                  height: INDICATOR_SIZE,
                  rotate: 45,
                  borderRadius: 4.5,
                }
              : {
                  width: INDICATOR_SIZE - 6,
                  height: 28,
                  rotate: 0,
                  borderRadius: 6,
                }
          }
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          onClick={toggle}
        >
          <motion.div
            className="size-2 rounded-full bg-white/90"
            animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.15, delay: isOpen ? 0.1 : 0 }}
          />
        </motion.div>

        <motion.div
          className="flex h-full items-center shrink-0 overflow-hidden"
          animate={{
            width: isOpen ? contentWidth : 0,
            opacity: isOpen ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 240,
            damping: 26,
            opacity: { duration: 0.18 },
          }}
        >
          {/* Always rendered at full natural size, even while the parent
              clips it to 0 — that's what makes it measurable. */}
          <div ref={contentRef} className="flex items-center h-full">
            <div className="w-1.5 shrink-0" />

            <div
              onDoubleClick={() => setEditing(true)}
              onMouseEnter={() => setIsHoveringLabel(true)}
              onMouseLeave={() => setIsHoveringLabel(false)}
              className={cn(
                "relative flex h-full min-w-20 shrink-0 items-center gap-1.5 rounded-sm border px-2 cursor-pointer transition-colors",
                colorStyles.chipBg,
                colorStyles.chipText,
                colorStyles.chipBorder,
              )}
            >
              {editing ? (
                <input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") {
                      setEditing(false);
                      setName(island.name);
                    }
                  }}
                  className="bg-transparent outline-none w-16 text-xs font-semibold"
                />
              ) : (
                <>
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {island.name}
                  </span>
                  {!isHoveringLabel && (
                    <span className="text-[10px] opacity-70 mt-0.75 ml-auto pl-1">
                      ({islandTabs.length})
                    </span>
                  )}
                  <AnimatePresence>
                    {isHoveringLabel && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.6, width: 0 }}
                        animate={{ opacity: 1, scale: 1, width: 14 }}
                        exit={{ opacity: 0, scale: 0.6, width: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => deleteIsland(island.id)}
                        className="ml-auto pl-1 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                        title="Ungroup Island"
                      >
                        <Unlink size={12} className="shrink-0" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            <div className="w-1.5 shrink-0" />

            <div className="flex h-full min-w-24 shrink-0 items-center gap-1 rounded-sm px-1 pl-0">
              <SortableContext
                items={islandTabs.map((t) => t.id)}
                strategy={horizontalListSortingStrategy}
              >
                {isEmpty ? (
                  <div className="flex h-7 px-3 items-center justify-center rounded text-[11px] text-muted-foreground/60 border border-dashed border-border whitespace-nowrap">
                    <span className="mt-0.75">Drop tabs here</span>
                  </div>
                ) : (
                  islandTabs.map((tab, index) => {
                    const isHoverTarget = hoverState?.targetTabId === tab.id;
                    const isArmedTarget = pendingGroup?.targetTabId === tab.id;
                    const sourceTab = isArmedTarget
                      ? allTabs.find((t) => t.id === pendingGroup?.sourceTabId)
                      : null;
                    return (
                      <HorizontalTabItem
                        key={tab.id}
                        tab={tab}
                        island={island}
                        index={index}
                        hoveredByTabId={
                          isHoverTarget ? hoverState!.draggingTabId : null
                        }
                        hoverProgress={isHoverTarget ? hoverState!.progress : 0}
                        showGroupTooltip={isArmedTarget}
                        groupSourceTab={sourceTab ?? null}
                      />
                    );
                  })
                )}
              </SortableContext>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default TabIsland;
