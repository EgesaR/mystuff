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

  const displayName = user?.full_name || user?.username || "Your Account";
  const userInitial =
    displayName !== "Your Account" ? displayName.charAt(0).toUpperCase() : null;

  // STRICT CLICK HANDLER: No more useEffect fighting the router.
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof MAIN_NAV_ITEMS)[0],
  ) => {
    e.preventDefault();
    navigate(item.route);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="h-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl flex flex-col transition-all duration-300 rounded-2xl shadow-sm"
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
                  ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-medium",
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
                  ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-medium",
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
