import { useEffect, useRef, useState } from "react";
import {
  MotionConfig,
  motion,
  useAnimate,
  AnimatePresence,
  type Transition,
} from "framer-motion";
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
import { Unlink } from "lucide-react"; // Import an icon for ungrouping

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
  const [scope, animate] = useAnimate();
  const [isOpen, setIsOpen] = useState(!island.isCollapsed);
  const [animating, setAnimating] = useState(false);

  // Track hover on the island label to show ungroup button
  const [isHoveringLabel, setIsHoveringLabel] = useState(false);

  // Editable name state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(island.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const colorStyles = getIslandColorStyles(island.color);
  const isEmpty = islandTabs.length === 0;

  const { setNodeRef, isOver } = useDroppable({
    id: `${ISLAND_DROP_PREFIX}${island.id}`,
    data: {
      type: "Island",
      islandId: island.id,
    },
  });

  const layoutSpring: Transition = {
    type: "spring",
    stiffness: 220,
    damping: 22,
    bounce: 0,
  };

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const handleRename = () => {
    if (name.trim() && name !== island.name) {
      updateIsland(island.id, { name: name.trim() });
    }
    setEditing(false);
  };

  const toggle = async () => {
    if (animating) return;
    setAnimating(true);

    const smoothClose = { duration: 0.2, ease: "easeInOut" } as const;
    const springOpen = { type: "spring", stiffness: 220, damping: 22 } as const;
    const indicatorSpring = {
      type: "spring",
      stiffness: 260,
      damping: 22,
    } as const;

    if (isOpen) {
      // Close Mask
      await animate(".panels-mask", { width: 0, opacity: 0 }, smoothClose);
      await animate(".dot", { scale: 0, opacity: 0 }, { duration: 0.12 });
      await animate(".indicator", { rotate: 0 }, { duration: 0.18 });
      await animate(
        ".indicator",
        { width: INDICATOR_SIZE - 6, height: 28, borderRadius: 6 },
        indicatorSpring,
      );
      setIsOpen(false);
      toggleIslandCollapse(island.id); // Save to LocalStorage
    } else {
      // Open Mask
      await animate(
        ".indicator",
        { width: INDICATOR_SIZE, height: INDICATOR_SIZE },
        indicatorSpring,
      );
      await animate(".indicator", { rotate: 45 }, { duration: 0.18 });
      await animate(".dot", { scale: 1, opacity: 1 }, { duration: 0.12 });

      await animate(".panels-mask", { width: "auto", opacity: 1 }, springOpen);
      setIsOpen(true);
      toggleIslandCollapse(island.id); // Save to LocalStorage
    }
    setAnimating(false);
  };

  return (
    <MotionConfig transition={layoutSpring}>
      <Card
        ref={setNodeRef}
        className={cn(
          "h-10 overflow-hidden rounded-lg p-0 shadow-sm shrink-0 transition-shadow bg-neutral-50/90",
          isOver ? "ring-2 ring-primary/50 ring-offset-1" : "border-border",
        )}
      >
        <CardContent ref={scope} className="flex h-full items-center p-1.5">
          {/* Rotating Indicator */}
          <motion.div
            className={cn(
              "indicator grid shrink-0 cursor-pointer place-items-center",
              colorStyles.bg,
            )}
            style={{ borderRadius: 4.5 }}
            initial={
              isOpen
                ? { width: INDICATOR_SIZE, height: INDICATOR_SIZE, rotate: 45 }
                : {
                    width: INDICATOR_SIZE - 6,
                    height: 28,
                    rotate: 0,
                    borderRadius: 6,
                  }
            }
            onClick={toggle}
          >
            <motion.div
              className="dot size-2 rounded-full bg-white/90"
              initial={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
            />
          </motion.div>

          {/* The Expanding Mask */}
          <motion.div
            className="panels-mask flex h-full items-center shrink-0"
            initial={{ width: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
          >
            <div className="w-1.5 shrink-0" />
            {/* Island Name Label + Ungroup Actions */}
            <div
              onDoubleClick={() => setEditing(true)}
              onMouseEnter={() => setIsHoveringLabel(true)}
              onMouseLeave={() => setIsHoveringLabel(false)}
              className={cn(
                "relative flex h-full min-w-20 shrink-0 items-center gap-1.5 rounded-sm px-2 cursor-pointer transition-colors",
                colorStyles.bg,
                colorStyles.text,
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

                  {/* Ungroup Button (Shows on Hover) */}
                  <AnimatePresence>
                    {isHoveringLabel && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.6, width: 0 }}
                        animate={{ opacity: 1, scale: 1, width: 14 }}
                        exit={{ opacity: 0, scale: 0.6, width: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => deleteIsland(island.id)}
                        className="ml-auto pl-1 flex items-center justify-center hover:text-white/70 transition-colors"
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
            {/* Sortable Tabs Container */}
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
          </motion.div>
        </CardContent>
      </Card>
    </MotionConfig>
  );
};

export default TabIsland;
