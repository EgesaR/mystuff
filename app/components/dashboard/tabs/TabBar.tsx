// src/components/TabBar/TabBar.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { FolderPlus, Plus } from "lucide-react";
import { LayoutGroup } from "framer-motion";
import { useTabs } from "~/context/TabContext";
import { cn } from "~/lib/utils";
import type { Tab } from "~/types/tabs";

// Sub-components
import TabIsland from "./TabIsland";
import {
  HOVER_DURATION,
  GROUP_COLORS,
  type HoverState,
  type PendingGroup,
} from "./constants";
import HorizontalTabItem from "./HorizontalTabItem";
import { Button } from "~/components/ui/button";

const TabBar = () => {
  const {
    tabs,
    islands,
    createTab,
    createIsland,
    moveTab,
    reorderTabs,
    getTabsByIsland,
  } = useTabs();

  const [activeDragItem, setActiveDragItem] = useState<{
    type: "Tab";
    item: Tab;
  } | null>(null);
  const [hoverState, setHoverState] = useState<HoverState | null>(null);
  const [pendingGroup, setPendingGroup] = useState<PendingGroup | null>(null);
  const hoverTimeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (tabs.length === 0) {
      createTab({
        title: "New Tab",
        url: `/dashboard?new=${Date.now()}`,
        icon: { type: "lucide", name: "File" },
      });
    }
  }, [tabs.length, createTab]);

  const allTabsOrdered = [...tabs].sort((a, b) => {
    const aIsland = a.islandId ?? "__none__";
    const bIsland = b.islandId ?? "__none__";
    if (aIsland !== bIsland) {
      if (aIsland === "__none__") return -1;
      if (bIsland === "__none__") return 1;
      const aIslandOrder = islands.find((i) => i.id === aIsland)?.order ?? 999;
      const bIslandOrder = islands.find((i) => i.id === bIsland)?.order ?? 999;
      return aIslandOrder - bIslandOrder;
    }
    return a.order - b.order;
  });

  const clearHoverTimer = () => {
    if (hoverTimeRef.current) {
      clearInterval(hoverTimeRef.current);
      hoverTimeRef.current = null;
    }
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeData = event.active.data.current;
    if (activeData?.type === "Tab")
      setActiveDragItem({ type: "Tab", item: activeData.tab as Tab });
    setPendingGroup(null);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (
        !over ||
        over.data.current?.type === "Island" ||
        over.data.current?.type !== "Tab" ||
        active.id === over.id
      ) {
        clearHoverTimer();
        setHoverState(null);
        setPendingGroup(null);
        return;
      }

      const draggingTabId = active.id.toString();
      const targetTabId = over.id.toString();

      if (hoverState?.targetTabId !== targetTabId) {
        clearHoverTimer();
        setPendingGroup(null);
        const startTime = Date.now();
        setHoverState({ draggingTabId, targetTabId, startTime, progress: 0 });

        hoverTimeRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / HOVER_DURATION, 1);
          setHoverState((prev) => (prev ? { ...prev, progress } : null));

          if (elapsed >= HOVER_DURATION) {
            clearHoverTimer();
            setPendingGroup({ sourceTabId: draggingTabId, targetTabId });
            setHoverState(null);
          }
        }, 50);
      }
    },
    [hoverState, pendingGroup],
  );

  const finalizeGroup = useCallback(
    (sourceTabId: string, targetTabId: string) => {
      const sourceTab = tabs.find((t) => t.id === sourceTabId);
      const targetTab = tabs.find((t) => t.id === targetTabId);
      if (!sourceTab || !targetTab) return;

      if (targetTab.islandId) {
        moveTab(sourceTabId, targetTab.islandId, 999);
      } else {
        const randomColor =
          GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
        const newIsland = createIsland({
          name: `${targetTab.title} group`,
          color: randomColor,
        });
        moveTab(targetTabId, newIsland.id, 0);
        moveTab(sourceTabId, newIsland.id, 1);
      }
    },
    [tabs, moveTab, createIsland],
  );

  const handleDragEnd = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      const armedGroup = pendingGroup;

      setActiveDragItem(null);
      clearHoverTimer();
      setHoverState(null);
      setPendingGroup(null);

      if (!over) return;
      const activeId = active.id.toString();
      const overId = over.id.toString();
      const overData = over.data.current;

      if (overData?.type === "Island") {
        const islandId = overData.islandId as string;
        const activeTab = tabs.find((t) => t.id === activeId);
        if (!activeTab || activeTab.islandId === islandId) return;
        const targetIslandTabs = getTabsByIsland(islandId);
        moveTab(activeTab.id, islandId, targetIslandTabs.length);
        return;
      }

      if (active.id === over.id) return;

      if (overData?.type === "Tab") {
        if (
          armedGroup &&
          armedGroup.sourceTabId === activeId &&
          armedGroup.targetTabId === overId
        ) {
          finalizeGroup(activeId, overId);
          return;
        }

        const activeTab = tabs.find((t) => t.id === activeId);
        const overTab = tabs.find((t) => t.id === overId);
        if (!activeTab || !overTab) return;

        if (activeTab.islandId === overTab?.islandId) {
          const containerTabs = getTabsByIsland(activeTab.islandId);
          const activeIndex = containerTabs.findIndex((t) => t.id === activeId);
          const overIndex = containerTabs.findIndex((t) => t.id === overId);
          if (activeIndex !== -1 && overIndex !== -1) {
            reorderTabs(
              arrayMove(containerTabs, activeIndex, overIndex).map((t) => t.id),
            );
          }
        } else {
          moveTab(activeTab.id, overTab?.islandId, overTab?.order);
        }
      }
    },
    [tabs, getTabsByIsland, moveTab, reorderTabs, pendingGroup, finalizeGroup],
  );

  const renderTabSegments = () => {
    const segments: React.ReactNode[] = [];
    const sortedIslands = useMemo(
      () => [...islands].sort((a, b) => a.order - b.order),
      [islands],
    );

    // 1. Render Animated Tab Islands
    for (const island of sortedIslands) {
      const islandTabs = getTabsByIsland(island.id);
      segments.push(
        <TabIsland
          key={island.id}
          island={island}
          islandTabs={islandTabs}
          allTabs={tabs}
          pendingGroup={pendingGroup}
          hoverState={hoverState}
        />,
      );
    }

    // 2. Render Ungrouped Tabs
    const ungroupedTabs = allTabsOrdered.filter((t) => !t.islandId);
    if (ungroupedTabs.length > 0) {
      segments.push(
        <SortableContext
          key="ungrouped"
          items={ungroupedTabs.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <LayoutGroup>
            <div className="flex items-center gap-1.5 px-0.5 h-full">
              {ungroupedTabs.map((tab, index) => {
                const isHoverTarget = hoverState?.targetTabId === tab.id;
                const isArmedTarget = pendingGroup?.targetTabId === tab.id;
                const sourceTab = isArmedTarget
                  ? tabs.find((t) => t.id === pendingGroup?.sourceTabId)
                  : null;
                return (
                  <HorizontalTabItem
                    key={tab.id}
                    tab={tab}
                    index={index}
                    hoveredByTabId={
                      isHoverTarget ? hoverState!.draggingTabId : null
                    }
                    hoverProgress={isHoverTarget ? hoverState!.progress : 0}
                    showGroupTooltip={isArmedTarget}
                    groupSourceTab={sourceTab ?? null}
                  />
                );
              })}
            </div>
          </LayoutGroup>
        </SortableContext>,
      );
    }

    return segments;
  };

  return (
    <div className="flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      >
        <div className="flex items-center gap-2 px-2 pr-3 pb-1 pt-1.5 h-16">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none min-w-0 flex-1 h-full pt-1">
            {renderTabSegments()}
          </div>

          <div className="shrink-0 flex items-center gap-1 h-full border-l pl-2 border-border/50">
            <Button
              onClick={() =>
                createTab({
                  title: "New Tab",
                  url: `/dashboard?new=${Date.now()}`,
                  icon: { type: "lucide", name: "File" },
                })
              }
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent hover:bg-white shadow-none border-none transition-colors shrink-0"
            >
              <Plus size={15} />
            </Button>
            <Button
              onClick={() => createIsland({ name: "New Group", color: "blue" })}
              variant="outline"
              size="icon"
              className="rounded-full bg-transparent hover:bg-white shadow-none border-none transition-colors shrink-0"
            >
              <FolderPlus size={14} />
            </Button>
          </div>
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.2)",
          }}
        >
          {activeDragItem?.type === "Tab" && (
            <HorizontalTabItem tab={activeDragItem.item} isOverlay />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default TabBar;
