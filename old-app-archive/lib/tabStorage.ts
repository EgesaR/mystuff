import { useId } from "react";
import type { TabState, Tab, TabIsland, TabId } from "~/types/tabs";

export const getStorageKey = (userId?: string) =>
  userId ? `my-stuff-tab-islands-${userId}` : "my-stuff-tab-islands-anonymous";
const STORAGE_KEY = "my-stuff-tab-islands-state";

export const defaultIslands: TabIsland[] = [];
export const defaultTabs: Tab[] = [];

export const getDefaultState = (): TabState => ({
  tabs: [...defaultTabs],
  islands: [...defaultIslands],
  activeTabId: null,
});

export const loadTabState = (userId?: string): TabState => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (!stored) return getDefaultState();

    const parsed = JSON.parse(stored) as TabState;

    // Validate the parsed state structure
    if (
      !parsed ||
      !parsed.tabs ||
      !Array.isArray(parsed.tabs) ||
      !parsed.islands ||
      !Array.isArray(parsed.islands)
    ) {
      return getDefaultState();
    }

    return parsed;
  } catch {
    return getDefaultState();
  }
};

export const saveTabState = (state: TabState, userId?: string): void => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const clearTabState = (userId?: string): void => {
  try {
    localStorage.removeItem(getStorageKey(userId));
  } catch {
    // Silently fail
  }
};
