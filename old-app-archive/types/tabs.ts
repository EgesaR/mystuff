import { type ReactNode } from "react";
import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";
import type { WorkspaceRoute } from "~/lib/tabRoutes";

export type TabId = string;
export type IslandId = string;

export type TabStatus = "idle" | "loading" | "error" | "success";

export type TabIcon = {
  type: "lucide" | "react-icon";
  name: string;
};

export interface Tab {
  id: TabId;
  workspaceId: WorkspaceRoute | null;
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

const ISLAND_STYLE_MAP: Record<
  IslandColor,
  {
    dot: string;
    chipBg: string;
    chipText: string;
    chipBorder: string;
    ring: string;
  }
> = {
  red: {
    dot: "bg-red-500",
    chipBg: "bg-red-500/10",
    chipText: "text-red-700 dark:text-red-300",
    chipBorder: "border-red-500/20",
    ring: "ring-red-500/30",
  },
  orange: {
    dot: "bg-orange-500",
    chipBg: "bg-orange-500/10",
    chipText: "text-orange-700 dark:text-orange-300",
    chipBorder: "border-orange-500/20",
    ring: "ring-orange-500/30",
  },
  amber: {
    dot: "bg-amber-500",
    chipBg: "bg-amber-500/10",
    chipText: "text-amber-700 dark:text-amber-300",
    chipBorder: "border-amber-500/20",
    ring: "ring-amber-500/30",
  },
  green: {
    dot: "bg-green-500",
    chipBg: "bg-green-500/10",
    chipText: "text-green-700 dark:text-green-300",
    chipBorder: "border-green-500/20",
    ring: "ring-green-500/30",
  },
  emerald: {
    dot: "bg-emerald-500",
    chipBg: "bg-emerald-500/10",
    chipText: "text-emerald-700 dark:text-emerald-300",
    chipBorder: "border-emerald-500/20",
    ring: "ring-emerald-500/30",
  },
  teal: {
    dot: "bg-teal-500",
    chipBg: "bg-teal-500/10",
    chipText: "text-teal-700 dark:text-teal-300",
    chipBorder: "border-teal-500/20",
    ring: "ring-teal-500/30",
  },
  cyan: {
    dot: "bg-cyan-500",
    chipBg: "bg-cyan-500/10",
    chipText: "text-cyan-700 dark:text-cyan-300",
    chipBorder: "border-cyan-500/20",
    ring: "ring-cyan-500/30",
  },
  blue: {
    dot: "bg-blue-500",
    chipBg: "bg-blue-500/10",
    chipText: "text-blue-700 dark:text-blue-300",
    chipBorder: "border-blue-500/20",
    ring: "ring-blue-500/30",
  },
  indigo: {
    dot: "bg-indigo-500",
    chipBg: "bg-indigo-500/10",
    chipText: "text-indigo-700 dark:text-indigo-300",
    chipBorder: "border-indigo-500/20",
    ring: "ring-indigo-500/30",
  },
  violet: {
    dot: "bg-violet-500",
    chipBg: "bg-violet-500/10",
    chipText: "text-violet-700 dark:text-violet-300",
    chipBorder: "border-violet-500/20",
    ring: "ring-violet-500/30",
  },
  purple: {
    dot: "bg-purple-500",
    chipBg: "bg-purple-500/10",
    chipText: "text-purple-700 dark:text-purple-300",
    chipBorder: "border-purple-500/20",
    ring: "ring-purple-500/30",
  },
  fuchsia: {
    dot: "bg-fuchsia-500",
    chipBg: "bg-fuchsia-500/10",
    chipText: "text-fuchsia-700 dark:text-fuchsia-300",
    chipBorder: "border-fuchsia-500/20",
    ring: "ring-fuchsia-500/30",
  },
  pink: {
    dot: "bg-pink-500",
    chipBg: "bg-pink-500/10",
    chipText: "text-pink-700 dark:text-pink-300",
    chipBorder: "border-pink-500/20",
    ring: "ring-pink-500/30",
  },
  rose: {
    dot: "bg-rose-500",
    chipBg: "bg-rose-500/10",
    chipText: "text-rose-700 dark:text-rose-300",
    chipBorder: "border-rose-500/20",
    ring: "ring-rose-500/30",
  },
};

export const getIslandColorStyles = (color: IslandColor) =>
  ISLAND_STYLE_MAP[color] ?? ISLAND_STYLE_MAP.blue;

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
