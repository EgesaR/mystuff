import {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router";
import { v4 as uuidv4 } from "uuid";
import type {
  TabState,
  TabActions,
  Tab,
  TabIsland,
  TabId,
  IslandId,
  TabStatus,
} from "~/types/tabs";
import { loadTabState, saveTabState, getDefaultState } from "~/lib/tabStorage";

type TabAction =
  | { type: "SET_STATE"; payload: TabState }
  | { type: "CREATE_TAB"; payload: Tab }
  | { type: "UPDATE_TAB"; payload: { id: TabId; updates: Partial<Tab> } }
  | { type: "DELETE_TAB"; payload: TabId }
  | { type: "SET_ACTIVE_TAB"; payload: TabId }
  | { type: "PIN_TAB"; payload: TabId }
  | { type: "UNPIN_TAB"; payload: TabId }
  | {
      type: "MOVE_TAB";
      payload: {
        tabId: TabId;
        targetIslandId: IslandId | null;
        newOrder: number;
      };
    }
  | { type: "CREATE_ISLAND"; payload: TabIsland }
  | {
      type: "UPDATE_ISLAND";
      payload: { id: IslandId; updates: Partial<TabIsland> };
    }
  | { type: "DELETE_ISLAND"; payload: IslandId }
  | { type: "TOGGLE_ISLAND_COLLAPSE"; payload: IslandId }
  | { type: "REORDER_TABS"; payload: TabId[] }
  | { type: "REORDER_ISLANDS"; payload: IslandId[] }
  | { type: "SET_TAB_STATUS"; payload: { id: TabId; status: TabStatus } };

function tabReducer(state: TabState, action: TabAction): TabState {
  switch (action.type) {
    case "SET_STATE":
      return action.payload;

    case "CREATE_TAB": {
      // Determine the new active ID
      const newActiveId = action.payload.isActive
        ? action.payload.id
        : state.activeTabId;

      return {
        ...state,
        // FIX 1: Map over ALL tabs (including the new one) to ensure ONLY the active one is true
        tabs: [...state.tabs, action.payload].map((t) => ({
          ...t,
          isActive: t.id === newActiveId,
        })),
        activeTabId: newActiveId,
      };
    }

    case "UPDATE_TAB": {
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.payload.id
            ? { ...t, ...action.payload.updates, updatedAt: Date.now() }
            : t,
        ),
      };
    }

    case "DELETE_TAB": {
      const deletedTab = state.tabs.find((t) => t.id === action.payload);
      const filteredTabs = state.tabs.filter((t) => t.id !== action.payload);
      let newActiveId = state.activeTabId;

      if (state.activeTabId === action.payload && deletedTab) {
        // Sort tabs exactly as they appear visually to find the true neighbor
        const sortedTabs = [...state.tabs].sort((a, b) => {
          const aIsland = a.islandId ?? "__none__";
          const bIsland = b.islandId ?? "__none__";
          if (aIsland !== bIsland) {
            if (aIsland === "__none__") return -1;
            if (bIsland === "__none__") return 1;
            const aIslandOrder =
              state.islands.find((i) => i.id === aIsland)?.order ?? 999;
            const bIslandOrder =
              state.islands.find((i) => i.id === bIsland)?.order ?? 999;
            return aIslandOrder - bIslandOrder;
          }
          return a.order - b.order;
        });

        const deletedIndex = sortedTabs.findIndex(
          (t) => t.id === action.payload,
        );

        if (filteredTabs.length === 0) {
          newActiveId = null;
        } else {
          // Attempt to select the next tab to the right, otherwise fallback to the left
          const nextTab = sortedTabs[deletedIndex + 1];
          const prevTab = sortedTabs[deletedIndex - 1];

          if (nextTab) {
            newActiveId = nextTab.id;
          } else if (prevTab) {
            newActiveId = prevTab.id;
          } else {
            newActiveId = filteredTabs[0].id;
          }
        }
      }

      // FIX 2: Map over the remaining tabs and sync the isActive flag with the newly chosen newActiveId
      const updatedTabs = filteredTabs.map((t) => ({
        ...t,
        isActive: t.id === newActiveId,
      }));

      return {
        ...state,
        tabs: updatedTabs,
        activeTabId: newActiveId,
      };
    }

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        tabs: state.tabs.map((t) => ({
          ...t,
          isActive: t.id === action.payload,
        })),
        activeTabId: action.payload,
      };

    case "PIN_TAB":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.payload
            ? { ...t, isPinned: true, updatedAt: Date.now() }
            : t,
        ),
      };

    case "UNPIN_TAB":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.payload
            ? { ...t, isPinned: false, updatedAt: Date.now() }
            : t,
        ),
      };

    case "MOVE_TAB": {
      const { tabId, targetIslandId, newOrder } = action.payload;
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId
            ? {
                ...t,
                islandId: targetIslandId,
                order: newOrder,
                updatedAt: Date.now(),
              }
            : t,
        ),
      };
    }

    case "CREATE_ISLAND":
      return {
        ...state,
        islands: [...state.islands, action.payload],
      };

    case "UPDATE_ISLAND":
      return {
        ...state,
        islands: state.islands.map((i) =>
          i.id === action.payload.id
            ? { ...i, ...action.payload.updates, updatedAt: Date.now() }
            : i,
        ),
      };

    case "DELETE_ISLAND": {
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.islandId === action.payload
            ? { ...t, islandId: null, updatedAt: Date.now() }
            : t,
        ),
        islands: state.islands.filter((i) => i.id !== action.payload),
      };
    }

    case "TOGGLE_ISLAND_COLLAPSE":
      return {
        ...state,
        islands: state.islands.map((i) =>
          i.id === action.payload
            ? { ...i, isCollapsed: !i.isCollapsed, updatedAt: Date.now() }
            : i,
        ),
      };

    case "REORDER_TABS": {
      const orderMap = new Map(action.payload.map((id, index) => [id, index]));
      return {
        ...state,
        tabs: state.tabs.map((t) => ({
          ...t,
          order: orderMap.has(t.id) ? orderMap.get(t.id)! : t.order,
        })),
      };
    }

    case "REORDER_ISLANDS": {
      const orderMap = new Map(action.payload.map((id, index) => [id, index]));
      return {
        ...state,
        islands: state.islands.map((i) => ({
          ...i,
          order: orderMap.has(i.id) ? orderMap.get(i.id)! : i.order,
        })),
      };
    }

    case "SET_TAB_STATUS":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.payload.id
            ? { ...t, status: action.payload.status }
            : t,
        ),
      };

    default:
      return state;
  }
}

const TabContext = createContext<(TabState & TabActions) | null>(null);

export function TabProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, dispatch] = useReducer(tabReducer, null, () => loadTabState());
  const isInitialMount = useRef(true);
  const isNavigating = useRef(false);

  // Save state to localStorage on changes
  useEffect(() => {
    saveTabState(state);
  }, [state]);

  // 1. Handle URL changes (Initial load, Browser Back/Forward, Address Bar)
  useEffect(() => {
    // If the navigation was triggered by clicking a tab, ignore it here
    if (isNavigating.current) {
      isNavigating.current = false;
      return;
    }

    const matchingTab = state.tabs.find((t) => t.url === location.pathname);

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (matchingTab && state.activeTabId !== matchingTab.id) {
        dispatch({ type: "SET_ACTIVE_TAB", payload: matchingTab.id });
      }
      // REMOVED: The aggressive redirect that blocked 404s on initial load
      return;
    }

    // For subsequent external URL changes
    if (matchingTab && state.activeTabId !== matchingTab.id) {
      dispatch({ type: "SET_ACTIVE_TAB", payload: matchingTab.id });
    }
    // IF !matchingTab: We purposefully do nothing!
    // This allows React Router to naturally fall back to dashboard.$.tsx
  }, [location.pathname, state.tabs, state.activeTabId]);

  // 2. Handle Tab Selection (User clicks a tab or a tab is deleted)
  useEffect(() => {
    if (isInitialMount.current) return;

    const activeTab = state.tabs.find((t) => t.id === state.activeTabId);

    // Only force a navigation if the active tab's URL doesn't match the current URL
    if (activeTab && location.pathname !== activeTab.url) {
      isNavigating.current = true;
      navigate(activeTab.url, { replace: true });
    }
  }, [state.activeTabId, navigate]); // ONLY trigger when activeTabId changes

  const createTab = useCallback(
    (params: Partial<Omit<Tab, "id" | "createdAt" | "updatedAt">>): Tab => {
      const islandTabs = state.tabs.filter(
        (t) => t.islandId === (params.islandId ?? null),
      );
      const maxOrder =
        islandTabs.length > 0
          ? Math.max(...islandTabs.map((t) => t.order))
          : -1;

      const newTab: Tab = {
        id: `tab-${uuidv4()}`,
        title: params.title ?? "New Tab",
        url: params.url ?? "/dashboard",
        islandId: params.islandId ?? null,
        icon: params.icon ?? { type: "lucide", name: "File" },
        status: params.status ?? "idle",
        isActive: true,
        isPinned: params.isPinned ?? false,
        order: params.order ?? maxOrder + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      dispatch({ type: "CREATE_TAB", payload: newTab });
      return newTab;
    },
    [state.tabs],
  );

  const updateTab = useCallback((id: TabId, updates: Partial<Tab>) => {
    dispatch({ type: "UPDATE_TAB", payload: { id, updates } });
  }, []);

  const deleteTab = useCallback((id: TabId) => {
    dispatch({ type: "DELETE_TAB", payload: id });
  }, []);

  const setActiveTab = useCallback((id: TabId) => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: id });
  }, []);

  const pinTab = useCallback((id: TabId) => {
    dispatch({ type: "PIN_TAB", payload: id });
  }, []);

  const unpinTab = useCallback((id: TabId) => {
    dispatch({ type: "UNPIN_TAB", payload: id });
  }, []);

  const moveTab = useCallback(
    (tabId: TabId, targetIslandId: IslandId | null, newOrder: number) => {
      dispatch({
        type: "MOVE_TAB",
        payload: { tabId, targetIslandId, newOrder },
      });
    },
    [],
  );

  const createIsland = useCallback(
    (
      params: Partial<Omit<TabIsland, "id" | "createdAt" | "updatedAt">>,
    ): TabIsland => {
      const maxOrder =
        state.islands.length > 0
          ? Math.max(...state.islands.map((i) => i.order))
          : -1;

      const newIsland: TabIsland = {
        id: `island-${uuidv4()}`,
        name: params.name ?? "New Island",
        color: params.color ?? "blue",
        order: params.order ?? maxOrder + 1,
        isCollapsed: params.isCollapsed ?? false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      dispatch({ type: "CREATE_ISLAND", payload: newIsland });
      return newIsland;
    },
    [state.islands],
  );

  const updateIsland = useCallback(
    (id: IslandId, updates: Partial<TabIsland>) => {
      dispatch({ type: "UPDATE_ISLAND", payload: { id, updates } });
    },
    [],
  );

  const deleteIsland = useCallback((id: IslandId) => {
    dispatch({ type: "DELETE_ISLAND", payload: id });
  }, []);

  const toggleIslandCollapse = useCallback((id: IslandId) => {
    dispatch({ type: "TOGGLE_ISLAND_COLLAPSE", payload: id });
  }, []);

  const reorderTabs = useCallback((tabIds: TabId[]) => {
    dispatch({ type: "REORDER_TABS", payload: tabIds });
  }, []);

  const reorderIslands = useCallback((islandIds: IslandId[]) => {
    dispatch({ type: "REORDER_ISLANDS", payload: islandIds });
  }, []);

  const setTabStatus = useCallback((id: TabId, status: TabStatus) => {
    dispatch({ type: "SET_TAB_STATUS", payload: { id, status } });
  }, []);

  const getTabsByIsland = useCallback(
    (islandId: IslandId | null) => {
      return state.tabs
        .filter((t) => t.islandId === islandId)
        .sort((a, b) => a.order - b.order);
    },
    [state.tabs],
  );

  const getIslandById = useCallback(
    (id: IslandId) => {
      return state.islands.find((i) => i.id === id);
    },
    [state.islands],
  );

  const getTabById = useCallback(
    (id: TabId) => {
      return state.tabs.find((t) => t.id === id);
    },
    [state.tabs],
  );

  const getActiveTab = useCallback(() => {
    return state.tabs.find((t) => t.id === state.activeTabId);
  }, [state.tabs, state.activeTabId]);

  const value: TabState & TabActions = {
    ...state,
    createTab,
    updateTab,
    deleteTab,
    setActiveTab,
    pinTab,
    unpinTab,
    moveTab,
    createIsland,
    updateIsland,
    deleteIsland,
    toggleIslandCollapse,
    reorderTabs,
    reorderIslands,
    setTabStatus,
    getTabsByIsland,
    getIslandById,
    getTabById,
    getActiveTab,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

export function useTabs() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabProvider");
  }
  return context;
}
