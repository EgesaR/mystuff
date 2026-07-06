import { requireUser } from "~/lib/loaders/auth.server";
import type { Route } from "./+types/dashboard";
import { Outlet, useLoaderData, useLocation } from "react-router";
import { TabProvider } from "~/context/TabContext";
import TabBar from "~/components/dashboard/tabs/TabBar";
import { TabPanel } from "~/components/dashboard/tabs/TabPanel";
import { SidebarProvider } from "~/components/ui/sidebar";
import NavigationRail from "~/components/dashboard/navigation_rail/NavigationRail";
import { AuthProvider } from "~/context/AuthProvider";

export const meta: Route.MetaFunction = () => [
  { title: "Dashboard" },
  { name: "description", content: "Description" },
  { name: "keywords", content: "Keywords" },
  { name: "author", content: "Author" },
  { name: "robots", content: "index, follow" },
];

export async function loader({ request }: Route.LoaderArgs) {
  return requireUser(request);
}

const Dashboard = () => {
  const user = useLoaderData<typeof loader>();
  const location = useLocation();
  return (
    <AuthProvider initialUser={user}>
      <TabProvider>
        <SidebarProvider
          style={
            {
              // 👇 FIX: Declare the proper expanded vs collapsed rail metrics
              "--sidebar-width": "14rem", // Width when expanded (~224px)
              "--sidebar-width-icon": "3rem", // Width when collapsed (~48px / w-12 equivalent)
              "--sidebar-width-mobile": "20rem",
            } as React.CSSProperties
          }
        >
          <div className="flex gap-2 h-screen w-full bg-neutral-200/40 dark:bg-neutral-900 p-2">
            <NavigationRail />

            {/* Main Workspace Panel */}
            <div className="shrink grow h-full overflow-hidden flex flex-col gap-2">
              <TabBar />
              <TabPanel />
            </div>
          </div>
        </SidebarProvider>
      </TabProvider>
    </AuthProvider>
  );
};

export default Dashboard;
