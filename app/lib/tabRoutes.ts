import type { TabIcon } from "~/types/tabs";

export type WorkspaceRoute =
  | "/dashboard"
  | "/dashboard/notes"
  | "/dashboard/tasks"
  | "/dashboard/storage"
  | "/dashboard/settings";

const WORKSPACE_ROUTES: WorkspaceRoute[] = [
  "/dashboard",
  "/dashboard/notes",
  "/dashboard/tasks",
  "/dashboard/storage",
  "/dashboard/settings",
];

/**
 * Returns the workspace that owns a URL.
 *
 * Examples:
 * /dashboard/settings/security -> /dashboard/settings
 * /dashboard/settings          -> /dashboard/settings
 * /dashboard/notes             -> /dashboard/notes
 * /dashboard                   -> /dashboard
 */

export function getWorkspaceRoute(pathname: string): WorkspaceRoute {
  const sorted = [...WORKSPACE_ROUTES].sort((a, b) => b.length - a.length);

  const match = sorted.find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return match ?? "/dashboard";
}

export function getWorkspaceTitle(pathname: string): string {
  switch (getWorkspaceRoute(pathname)) {
    case "/dashboard":
      return "Dashboard";
    case "/dashboard/notes":
      return "Notes";
    case "/dashboard/tasks":
      return "Tasks";
    case "/dashboard/storage":
      return "Storage";
    case "/dashboard/settings":
      return "Settings";
  }
}

export function getWorkspaceIcon(pathname: string): TabIcon {
  switch (getWorkspaceRoute(pathname)) {
    case "/dashboard":
      return {
        type: "lucide",
        name: "LayoutDashboard",
      };
    case "/dashboard/notes":
      return {
        type: "lucide",
        name: "StickyNote",
      };
    case "/dashboard/tasks":
      return {
        type: "lucide",
        name: "CheckSquare",
      };
    case "/dashboard/storage":
      return {
        type: "lucide",
        name: "Cloud",
      };
    case "/dashboard/settings":
      return {
        type: "lucide",
        name: "Settings",
      };
  }
}
