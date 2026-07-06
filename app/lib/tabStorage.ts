import type { TabState, Tab, TabIsland, TabId } from "~/types/tabs";

const STORAGE_KEY = "my-stuff-tab-islands-state";

// 1. Empty out the default islands so they don't reappear on a fresh load
export const defaultIslands: TabIsland[] = [];

// 2. Keep default tabs empty
export const defaultTabs: Tab[] = [];

export const getDefaultState = (): TabState => ({
  tabs: [...defaultTabs],
  islands: [...defaultIslands],
  // 3. FIX: Set to null. "tab-home" doesn't exist anymore, which would cause errors!
  activeTabId: null,
});

export const loadTabState = (): TabState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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

export const saveTabState = (state: TabState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const clearTabState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
};
