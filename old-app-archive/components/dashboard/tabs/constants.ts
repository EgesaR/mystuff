export const ISLAND_DROP_PREFIX = "island-drop-";
export const HOVER_DURATION = 2000; // milliseconds

// We swapped "yellow" for "amber" to perfectly match your IslandColor type!
export const GROUP_COLORS = [
  "red",
  "orange",
  "blue",
  "purple",
  "teal",
  "green",
  "amber",
  "pink",
  "indigo",
  "cyan",
] as const;

export type PendingGroup = {
  sourceTabId: string;
  color?: (typeof GROUP_COLORS)[number];
  targetTabId: string;
};

export type HoverState = {
  draggingTabId: string;
  targetTabId: string;
  startTime: number;
  progress: number;
};
