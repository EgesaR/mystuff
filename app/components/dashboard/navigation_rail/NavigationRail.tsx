import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import {
  Home,
  StickyNote,
  CheckSquare,
  Cloud,
  Bell,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import { useTabs } from "~/context/TabContext";

const MAIN_NAV_ITEMS = [
  {
    label: "Home",
    icon: Home,
    iconName: "Home",
    id: "home",
    route: "/dashboard",
  },
  {
    label: "Notes",
    icon: StickyNote,
    iconName: "StickyNote",
    id: "notes",
    route: "/dashboard/notes",
  },
  {
    label: "Tasks",
    icon: CheckSquare,
    iconName: "CheckSquare",
    id: "tasks",
    route: "/dashboard/tasks",
  },
  {
    label: "Cloud Storage",
    icon: Cloud,
    iconName: "Cloud",
    id: "storage",
    route: "/dashboard/storage",
  },
];

const UTILITY_NAV_ITEMS = [
  {
    label: "Notifications",
    icon: Bell,
    iconName: "Bell",
    id: "notifications",
    route: "/dashboard/notifications",
  },
  {
    label: "Feedback",
    icon: MessageSquare,
    iconName: "MessageSquare",
    id: "feedback",
    route: "/dashboard/feedback",
  },
  {
    label: "Settings",
    icon: Settings,
    iconName: "Settings",
    id: "settings",
    route: "/dashboard/settings",
  },
];

const NavigationRail = () => {
  const { open, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    tabs,
    activeTabId,
    createTab,
    updateTab,
    setActiveTab,
    getActiveTab,
  } = useTabs();

  const displayName = user?.full_name || user?.username || "Your Account";
  const userInitial =
    displayName !== "Your Account" ? displayName.charAt(0).toUpperCase() : null;

  // STRICT CLICK HANDLER: No more useEffect fighting the router.
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof MAIN_NAV_ITEMS)[0],
  ) => {
    e.preventDefault();

    const existingTab = tabs.find((t) => t.url.split("?")[0] === item.route);

    if (existingTab) {
      setActiveTab(existingTab.id);
      navigate(item.route);
    } else {
      const currentActive = getActiveTab();
      // If we are currently sitting on a blank "New Tab", morph it into the clicked route
      if (currentActive && currentActive.title === "New Tab") {
        updateTab(currentActive.id, {
          title: item.label,
          url: item.route,
          icon: { type: "lucide", name: item.iconName },
        });
        navigate(item.route);
      } else {
        // Otherwise, spawn a fresh tab
        createTab({
          title: item.label,
          url: item.route,
          icon: { type: "lucide", name: item.iconName },
        });
        // createTab automatically sets isActive: true, TabContext handles the router update.
      }
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="h-full border-0 bg-emerald-200/40! flex flex-col transition-all duration-300 rounded-2xl shadow-xs"
    >
      <SidebarHeader className="mt-2 flex items-center justify-center shrink-0">
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className={cn(
            "p-0 overflow-hidden border-0 rounded-full hover:bg-accent/60 transition-all",
            open ? "size-10 mt-2 mb-2 shadow-xs" : "size-8.5",
          )}
          title="Toggle Sidebar"
        >
          <img
            src="/pic.png"
            alt="logo"
            className="h-full w-full object-cover"
          />
        </Button>
      </SidebarHeader>

      <SidebarContent
        className={cn(
          "flex flex-col gap-2 mt-6 overflow-y-auto scrollbar-none transition-all",
          open ? "px-3 items-stretch" : "px-0 items-center",
        )}
      >
        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <a
              key={item.id}
              href={item.route}
              onClick={(e) => handleNavClick(e, item)}
              className={cn(
                "inline-flex items-center whitespace-nowrap rounded-xl text-sm transition-all duration-200 outline-none cursor-pointer focus-visible:ring-1 focus-visible:ring-ring",
                open
                  ? "w-full justify-start px-3 h-10 gap-3"
                  : "size-9 justify-center shrink-0",
                isActive
                  ? "bg-accent text-foreground font-semibold shadow-xs dark:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 font-medium",
              )}
              title={!open ? item.label : undefined}
            >
              <item.icon
                size={open ? 16 : 18}
                strokeWidth={isActive ? 2.5 : 2}
                className="shrink-0"
              />
              {open && (
                <span className="truncate text-[13px]">{item.label}</span>
              )}
            </a>
          );
        })}
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "flex flex-col gap-2 mb-4 shrink-0 transition-all",
          open ? "px-3 items-stretch" : "px-0 items-center",
        )}
      >
        {UTILITY_NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <a
              key={item.id}
              href={item.route}
              onClick={(e) => handleNavClick(e, item)}
              className={cn(
                "inline-flex items-center whitespace-nowrap rounded-xl text-sm transition-all duration-200 outline-none cursor-pointer focus-visible:ring-1 focus-visible:ring-ring",
                open
                  ? "w-full justify-start px-3 h-10 gap-3"
                  : "size-9 justify-center shrink-0",
                isActive
                  ? "bg-accent text-foreground font-semibold shadow-xs dark:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 font-medium",
              )}
              title={!open ? item.label : undefined}
            >
              <item.icon
                size={open ? 16 : 18}
                strokeWidth={isActive ? 2.5 : 2}
                className="shrink-0"
              />
              {open && (
                <span className="truncate text-[13px]">{item.label}</span>
              )}
            </a>
          );
        })}

        <div
          className={cn(
            "h-px bg-border my-1 rounded-full transition-all",
            open ? "w-full" : "w-6 place-self-center",
          )}
        />

        <Button
          variant="ghost"
          className={cn(
            "rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground hover:text-foreground mt-1 transition-all overflow-hidden p-0",
            open
              ? "w-full h-11 justify-start px-2 gap-2.5 rounded-xl"
              : "size-9 justify-center shrink-0",
          )}
          title="User Account"
        >
          <div className="shrink-0 size-7.5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs text-foreground uppercase">
            {userInitial ? userInitial : <User size={14} strokeWidth={2.5} />}
          </div>
          {open && (
            <div className="flex flex-col items-start truncate text-left select-none leading-tight">
              <span className="text-xs font-semibold text-foreground truncate w-full">
                {displayName}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground truncate w-full">
                {user?.email || "Free Plan"}
              </span>
            </div>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default NavigationRail;
