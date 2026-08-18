// app/routes/dashboard.$.tsx
import type { Route } from "./+types/dashboard.$";
import NotFound from "~/components/shared/NotFound";

export const meta: Route.MetaFunction = () => [
  { title: "Page Not Found | Dashboard" },
];

export default function DashboardNotFound() {
  return <NotFound />;
}
