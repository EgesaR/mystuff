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
import { loadTabState, saveTabState } from "~/lib/tabStorage";
import {
  getWorkspaceIcon,
  getWorkspaceRoute,
  getWorkspaceTitle,
} from "~/lib/tabRoutes";
import { useAuth } from "~/hooks/useAuth";
import { apiFetch } from "~/lib/http.client";
import { WS_URL } from "~/lib/config";

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
          newActiveId = null;
        } else {
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
  const { user } = useAuth();

  const [state, dispatch] = useReducer(tabReducer, null, () =>
    loadTabState(user?.id),
  );

  // Sync state tracking refs
  const lastSyncedJsonRef = useRef<string>(JSON.stringify(state));
  const isRemoteUpdateRef = useRef<boolean>(false);

  // Initial Load and Conflict Resolution
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    const localState = loadTabState(user.id);

    apiFetch("/api/tabs/sync", { method: "GET" })
      .then((res) => res.json())
      .then(
        (
          cloudResponse: { state_data?: TabState; updated_at?: string } | null,
        ) => {
          if (!isMounted) return;

          if (!cloudResponse?.state_data || !cloudResponse?.updated_at) {
            // Push local state if no cloud state exists yet
            const localJson = JSON.stringify(localState);
            lastSyncedJsonRef.current = localJson;

            apiFetch("/api/tabs/sync", {
              method: "POST",
              body: localJson,
              retries: 0,
            }).catch((err) =>
              console.error("Failed to initialize cloud tabs", err),
            );
            return;
          }

          const cloudData = cloudResponse.state_data;
          const cloudTimestamp = new Date(cloudResponse.updated_at).getTime();

          const localLatest = Math.max(
            ...localState.tabs.map((t) => t.updatedAt),
            ...localState.islands.map((i) => i.updatedAt),
            0,
          );

          if (cloudTimestamp > localLatest) {
            // Cloud is newer: Apply to local without triggering POST back
            isRemoteUpdateRef.current = true;
            lastSyncedJsonRef.current = JSON.stringify(cloudData);

            dispatch({ type: "SET_STATE", payload: cloudData });
            saveTabState(cloudData, user.id);
          } else if (localLatest > cloudTimestamp) {
            // Local is newer: Push up immediately
            const localJson = JSON.stringify(localState);
            lastSyncedJsonRef.current = localJson;

            apiFetch("/api/tabs/sync", {
              method: "POST",
              body: localJson,
              retries: 0,
            }).catch((err) =>
              console.error("Failed to sync newer local tabs", err),
            );
          }
        },
      )
      .catch((err) => console.error("Failed to fetch cloud tabs", err));

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Local Storage Persistence & Optimized Debounced Cloud Sync
  useEffect(() => {
    if (!user?.id || !state) return;

    saveTabState(state, user.id);

    // 1. If this state update came from the server, clear flag and DO NOT POST back
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    const currentJson = JSON.stringify(state);

    // 2. Diff Check: If the state hasn't actually changed, cancel sync
    if (currentJson === lastSyncedJsonRef.current) {
      return;
    }

    // 3. Debounce sync requests (1.5s window)
    const handler = setTimeout(() => {
      apiFetch("/api/tabs/sync", {
        method: "POST",
        body: currentJson,
        retries: 0,
      })
        .then(() => {
          lastSyncedJsonRef.current = currentJson;
        })
        .catch((err) => console.error("Failed to auto-save tabs", err));
    }, 1500);

    return () => clearTimeout(handler);
  }, [state, user?.id]);

  // Real-Time WebSocket Listener
  useEffect(() => {
    if (!user?.id) return;

    const wsNotificationsURL = `${WS_URL}/ws/notifications`;
    const ws = new WebSocket(wsNotificationsURL);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "WORKSPACE_UPDATED") {
          apiFetch("/api/tabs/sync", { method: "GET" })
            .then((res) => res.json())
            .then(
              (
                cloudResponse: {
                  state_data?: TabState;
                  updated_at?: string;
                } | null,
              ) => {
                if (!cloudResponse?.state_data || !cloudResponse.updated_at)
                  return;

                const cloudData = cloudResponse.state_data;
                const cloudJson = JSON.stringify(cloudData);

                // Stop execution if we already have this state synced locally
                if (cloudJson === lastSyncedJsonRef.current) {
                  return;
                }

                const cloudTimestamp = new Date(
                  cloudResponse.updated_at,
                ).getTime();
                const currentLocalState = loadTabState(user.id);
                const localLatest = Math.max(
                  ...currentLocalState.tabs.map((t) => t.updatedAt),
                  ...currentLocalState.islands.map((i) => i.updatedAt),
                  0,
                );

                if (cloudTimestamp > localLatest) {
                  // Mark as remote update so our auto-save effect doesn't POST it back
                  isRemoteUpdateRef.current = true;
                  lastSyncedJsonRef.current = cloudJson;

                  dispatch({ type: "SET_STATE", payload: cloudData });
                  saveTabState(cloudData, user.id);
                }
              },
            )
            .catch((err) =>
              console.error("Failed to pull real-time update", err),
            );
        }
      } catch (error) {
        console.error("Failed to parse websocket message", error);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => ws.close();
      } else if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user?.id]);

  function createTab(
    params: Partial<Omit<Tab, "id" | "createdAt" | "updatedAt">>,
  ): Tab {
    const islandTabs = state.tabs.filter(
      (t) => t.islandId === (params.islandId ?? null),
    );
    const maxOrder =
      islandTabs.length > 0 ? Math.max(...islandTabs.map((t) => t.order)) : -1;

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

  // Active Tab State -> Browser URL Sync
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

  // Synchronize route changes to tabs
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
