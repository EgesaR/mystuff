import { type ReactNode } from "react";
import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

export type TabId = string;
export type IslandId = string;

export type TabStatus = "idle" | "loading" | "error" | "success";

export type TabIcon = {
  type: "lucide" | "react-icon";
  name: string;
};

export interface Tab {
  id: TabId;
  title: string;
  url: string;
  islandId: IslandId | null;
  icon: TabIcon;
  status: TabStatus;
  isActive: boolean;
  isPinned: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface TabIsland {
  id: IslandId;
  name: string;
  color: IslandColor;
  order: number;
  isCollapsed: boolean;
  createdAt: number;
  updatedAt: number;
}

export type IslandColor =
  | "red"
  | "orange"
  | "amber"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";

export const ISLAND_COLORS: {
  value: IslandColor;
  label: string;
  hex: string;
}[] = [
  { value: "red", label: "Red", hex: "#EF4444" },
  { value: "orange", label: "Orange", hex: "#F97316" },
  { value: "amber", label: "Amber", hex: "#F59E0B" },
  { value: "green", label: "Green", hex: "#22C55E" },
  { value: "emerald", label: "Emerald", hex: "#10B981" },
  { value: "teal", label: "Teal", hex: "#14B8A6" },
  { value: "cyan", label: "Cyan", hex: "#06B6D4" },
  { value: "blue", label: "Blue", hex: "#3B82F6" },
  { value: "indigo", label: "Indigo", hex: "#6366F1" },
  { value: "violet", label: "Violet", hex: "#8B5CF6" },
  { value: "purple", label: "Purple", hex: "#A855F7" },
  { value: "fuchsia", label: "Fuchsia", hex: "#D946EF" },
  { value: "pink", label: "Pink", hex: "#EC4899" },
  { value: "rose", label: "Rose", hex: "#F43F5E" },
];

export const getIslandColorStyles = (color: IslandColor) => {
  const colorMap: Record<
    IslandColor,
    { bg: string; text: string; border: string; dot: string; ring: string }
  > = {
    red: {
      bg: "bg-linear-to-b from-red-500 to-red-500/90",
      text: "text-white",
      border: "border-red-500/30",
      dot: "bg-red-500",
      ring: "ring-red-500/30",
    },
    orange: {
      bg: "bg-linear-to-b from-orange-500 to-orange-500/90",
      text: "text-white",
      border: "border-orange-500/30",
      dot: "bg-orange-500",
      ring: "ring-orange-500/30",
    },
    amber: {
      bg: "bg-linear-to-b from-amber-500 to-amber-500/90",
      text: "text-white",
      border: "border-amber-500/30",
      dot: "bg-amber-500",
      ring: "ring-amber-500/30",
    },
    green: {
      bg: "bg-linear-to-b from-green-500 to-green-500/90",
      text: "text-white",
      border: "border-green-500/30",
      dot: "bg-green-500",
      ring: "ring-green-500/30",
    },
    emerald: {
      bg: "bg-linear-to-b from-emerald-500 to-emerald-500/90",
      text: "text-white",
      border: "border-emerald-500/30",
      dot: "bg-emerald-500",
      ring: "ring-emerald-500/30",
    },
    teal: {
      bg: "bg-linear-to-b from-teal-500 to-teal-500/90",
      text: "text-white",
      border: "border-teal-500/30",
      dot: "bg-teal-500",
      ring: "ring-teal-500/30",
    },
    cyan: {
      bg: "bg-linear-to-b from-cyan-500 to-cyan-500/90",
      text: "text-white",
      border: "border-cyan-500/30",
      dot: "bg-cyan-500",
      ring: "ring-cyan-500/30",
    },
    blue: {
      bg: "bg-linear-to-b from-blue-500 to-blue-500/90",
      text: "text-white",
      border: "border-blue-500/30",
      dot: "bg-blue-500",
      ring: "ring-blue-500/30",
    },
    indigo: {
      bg: "bg-linear-to-b from-indigo-500 to-indigo-500/90",
      text: "text-white",
      border: "border-indigo-500/30",
      dot: "bg-indigo-500",
      ring: "ring-indigo-500/30",
    },
    violet: {
      bg: "bg-linear-to-b from-violet-500 to-violet-500/90",
      text: "text-white",
      border: "border-violet-500/30",
      dot: "bg-violet-500",
      ring: "ring-violet-500/30",
    },
    purple: {
      bg: "bg-linear-to-b from-purple-500 to-purple-500/90",
      text: "text-white",
      border: "border-purple-500/30",
      dot: "bg-purple-500",
      ring: "ring-purple-500/30",
    },
    fuchsia: {
      bg: "bg-linear-to-b from-fuchsia-500 to-fuchsia-500/90",
      text: "text-white",
      border: "border-fuchsia-500/30",
      dot: "bg-fuchsia-500",
      ring: "ring-fuchsia-500/30",
    },
    pink: {
      bg: "bg-linear-to-b from-pink-500 to-pink-500/90",
      text: "text-white",
      border: "border-pink-500/30",
      dot: "bg-pink-500",
      ring: "ring-pink-500/30",
    },
    rose: {
      bg: "bg-linear-to-b from-rose-500 to-rose-500/90",
      text: "text-white",
      border: "border-rose-500/30",
      dot: "bg-rose-500",
      ring: "ring-rose-500/30",
    },
  };
  return colorMap[color] || colorMap.blue;
};

export interface TabState {
  tabs: Tab[];
  islands: TabIsland[];
  activeTabId: TabId | null;
}

export interface TabActions {
  // Tab operations
  createTab: (
    params: Partial<Omit<Tab, "id" | "createdAt" | "updatedAt">>,
  ) => Tab;
  updateTab: (id: TabId, updates: Partial<Tab>) => void;
  deleteTab: (id: TabId) => void;
  setActiveTab: (id: TabId) => void;
  pinTab: (id: TabId) => void;
  unpinTab: (id: TabId) => void;
  moveTab: (
    tabId: TabId,
    targetIslandId: IslandId | null,
    newOrder: number,
  ) => void;

  // Island operations
  createIsland: (
    params: Partial<Omit<TabIsland, "id" | "createdAt" | "updatedAt">>,
  ) => TabIsland;
  updateIsland: (id: IslandId, updates: Partial<TabIsland>) => void;
  deleteIsland: (id: IslandId) => void;
  toggleIslandCollapse: (id: IslandId) => void;

  // Bulk operations
  reorderTabs: (tabIds: TabId[]) => void;
  reorderIslands: (islandIds: IslandId[]) => void;

  // Tab status
  setTabStatus: (id: TabId, status: TabStatus) => void;

  // Getters
  getTabsByIsland: (islandId: IslandId | null) => Tab[];
  getIslandById: (id: IslandId) => TabIsland | undefined;
  getTabById: (id: TabId) => Tab | undefined;
  getActiveTab: () => Tab | undefined;
}

export type TabContextValue = TabState & TabActions;
