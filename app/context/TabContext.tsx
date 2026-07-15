import {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useEffect,
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
import { loadTabState, saveTabState } from "~/lib/tabStorage";
import {
  getWorkspaceIcon,
  getWorkspaceRoute,
  getWorkspaceTitle,
} from "~/lib/tabRoutes";

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
      // Prevent duplicate workspace tabs
      if (state.tabs.some((t) => t.id === action.payload.id)) {
        return state;
      }

      const newActiveId = action.payload.isActive
        ? action.payload.id
        : state.activeTabId;

      return {
        ...state,
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
      const deletedIndex = state.tabs.findIndex((t) => t.id === action.payload);
      if (deletedIndex === -1) return state;

      const filteredTabs = state.tabs.filter((t) => t.id !== action.payload);
      let newActiveId = state.activeTabId;

      if (state.activeTabId === action.payload) {
        if (filteredTabs.length === 0) {
          newActiveId = null; // Will trigger the useEffect to create a fresh tab
        } else {
          // Safe fallback: grab the tab that took its place, or the one to its left
          const fallbackTab =
            filteredTabs[deletedIndex] || filteredTabs[deletedIndex - 1];
          newActiveId = fallbackTab.id;
        }
      }

      return {
        ...state,
        tabs: filteredTabs.map((t) => ({
          ...t,
          isActive: t.id === newActiveId,
        })),
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
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.payload.tabId
            ? {
                ...t,
                islandId: action.payload.targetIslandId,
                order: action.payload.newOrder,
                updatedAt: Date.now(),
              }
            : t,
        ),
      };
    }

    case "CREATE_ISLAND":
      return { ...state, islands: [...state.islands, action.payload] };

    case "UPDATE_ISLAND":
      return {
        ...state,
        islands: state.islands.map((i) =>
          i.id === action.payload.id
            ? { ...i, ...action.payload.updates, updatedAt: Date.now() }
            : i,
        ),
      };

    case "DELETE_ISLAND":
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.islandId === action.payload
            ? { ...t, islandId: null, updatedAt: Date.now() }
            : t,
        ),
        islands: state.islands.filter((i) => i.id !== action.payload),
      };

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

  // Save to storage on every state change
  useEffect(() => {
    saveTabState(state);
  }, [state]);

  function createTab(
    params: Partial<Omit<Tab, "id" | "createdAt" | "updatedAt">>,
  ): Tab {
    const islandTabs = state.tabs.filter(
      (t) => t.islandId === (params.islandId ?? null),
    );
    const maxOrder =
      islandTabs.length > 0 ? Math.max(...islandTabs.map((t) => t.order)) : -1;

    // Only real workspace pages get a stable, route-derived id (so the
    // "one tab per workspace" dedupe in the reducer keeps working).
    // Everything else (ad hoc "New Tab" clicks) gets a real unique id.
    const id = params.workspaceId ?? `tab-${uuidv4()}`;

    const newTab: Tab = {
      id,
      workspaceId: params.workspaceId ?? null,
      title: params.title ?? "New Tab",
      url: params.url ?? `/dashboard?new=${Date.now()}`,
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
  }

  // Sync #1: Active Tab State -> Browser URL
  useEffect(() => {
    const active = state.tabs.find((t) => t.id === state.activeTabId);

    if (!active) return;

    if (location.pathname !== active.url) {
      navigate(active.url);
    }
  }, [state.activeTabId]);

  const updateTab = useCallback(
    (id: TabId, updates: Partial<Tab>) =>
      dispatch({ type: "UPDATE_TAB", payload: { id, updates } }),
    [],
  );
  const deleteTab = useCallback(
    (id: TabId) => dispatch({ type: "DELETE_TAB", payload: id }),
    [],
  );
  const setActiveTab = useCallback(
    (id: TabId) => dispatch({ type: "SET_ACTIVE_TAB", payload: id }),
    [],
  );
  const pinTab = useCallback(
    (id: TabId) => dispatch({ type: "PIN_TAB", payload: id }),
    [],
  );
  const unpinTab = useCallback(
    (id: TabId) => dispatch({ type: "UNPIN_TAB", payload: id }),
    [],
  );
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
    (id: IslandId, updates: Partial<TabIsland>) =>
      dispatch({ type: "UPDATE_ISLAND", payload: { id, updates } }),
    [],
  );
  const deleteIsland = useCallback(
    (id: IslandId) => dispatch({ type: "DELETE_ISLAND", payload: id }),
    [],
  );
  const toggleIslandCollapse = useCallback(
    (id: IslandId) => dispatch({ type: "TOGGLE_ISLAND_COLLAPSE", payload: id }),
    [],
  );
  const reorderTabs = useCallback(
    (tabIds: TabId[]) => dispatch({ type: "REORDER_TABS", payload: tabIds }),
    [],
  );
  const reorderIslands = useCallback(
    (islandIds: IslandId[]) =>
      dispatch({ type: "REORDER_ISLANDS", payload: islandIds }),
    [],
  );
  const setTabStatus = useCallback(
    (id: TabId, status: TabStatus) =>
      dispatch({ type: "SET_TAB_STATUS", payload: { id, status } }),
    [],
  );

  const getTabsByIsland = useCallback(
    (islandId: IslandId | null) =>
      state.tabs
        .filter((t) => t.islandId === islandId)
        .sort((a, b) => a.order - b.order),
    [state.tabs],
  );
  const getIslandById = useCallback(
    (id: IslandId) => state.islands.find((i) => i.id === id),
    [state.islands],
  );
  const getTabById = useCallback(
    (id: TabId) => state.tabs.find((t) => t.id === id),
    [state.tabs],
  );
  const getActiveTab = useCallback(
    () => state.tabs.find((t) => t.id === state.activeTabId),
    [state.tabs, state.activeTabId],
  );

  useEffect(() => {
    const workspace = getWorkspaceRoute(location.pathname);

    const existing = state.tabs.find((t) => t.workspaceId === workspace);
    
    if (!existing) {
      createTab({
        workspaceId: workspace,
        url: location.pathname,
        title: getWorkspaceTitle(location.pathname),
        icon: getWorkspaceIcon(location.pathname),
        status: "success",
        order: state.tabs.length,
      });

      return;
    }

    // Update URL if user navigated deeper into the workspace
    if (existing.url !== location.pathname) {
      updateTab(existing.id, {
        url: location.pathname,
      });
    }

    if (state.activeTabId !== existing.id) {
      setActiveTab(existing.id);
    }
  }, [location.pathname]);

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
  if (!context) throw new Error("useTabs must be used within a TabProvider");
  return context;
}
