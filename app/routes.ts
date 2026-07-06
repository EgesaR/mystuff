// app/routes.ts
import { type RouteConfig, route, index } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
  // 1. Load all files, but skip anything dashboard-related and the root catch-all,
  //    since those are defined manually below.
  ...(await flatRoutes({
    ignoredRouteFiles: [
      "**/$.tsx",
      "**/dashboard.tsx",
      "**/dashboard._index.tsx",
      "**/dashboard.$.tsx",
    ],
  })),

  // 2. Manually define the Dashboard branch
  route("dashboard", "routes/dashboard.tsx", [
    index("routes/dashboard._index.tsx"),
    route("*", "routes/dashboard.$.tsx"),
  ]),

  // 3. Global catch-all
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
