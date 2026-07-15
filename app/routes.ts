// app/routes.ts
import { type RouteConfig, route, index } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
  ...(await flatRoutes({
    ignoredRouteFiles: [
      "**/$.tsx",
      "**/dashboard.tsx",
      "**/dashboard._index.tsx",
      "**/dashboard.$.tsx",
      "**/dashboard.notes.tsx",
      "**/dashboard.tasks.tsx",
      "**/dashboard.storage.tsx",
      "**/dashboard.analytics.tsx",
      "**/dashboard.settings.tsx",
      "**/dashboard.settings._index.tsx",
      "**/dashboard.settings.account.tsx",
      "**/dashboard.notifications.tsx",
      "**/dashboard.settings.appearance.tsx",
      "**/dashboard.settings.security.tsx",
    ],
  })),

  route("dashboard", "routes/dashboard.tsx", [
    index("routes/dashboard._index.tsx"),
    route("notifications", "routes/dashboard.notifications.tsx"),

    route("notes", "routes/dashboard.notes.tsx"),
    route("tasks", "routes/dashboard.tasks.tsx"),
    route("storage", "routes/dashboard.storage.tsx"),
    route("analytics", "routes/dashboard.analytics.tsx"),
    route("settings", "routes/dashboard.settings.tsx", [
      index("routes/dashboard.settings._index.tsx"),
      route("account", "routes/dashboard.settings.account.tsx"),
      route("appearance", "routes/dashboard.settings.appearance.tsx"),
      route("security", "routes/dashboard.settings.security.tsx"),
    ]),
    route("*", "routes/dashboard.$.tsx"),
  ]),

  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
