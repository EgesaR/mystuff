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

type NavItem = {
  label: string;
  icon: React.ElementType;
  id: string;
  route: string;
};

const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: Home, id: "home", route: "/dashboard" },
  { label: "Notes", icon: StickyNote, id: "notes", route: "/dashboard/notes" },
  { label: "Tasks", icon: CheckSquare, id: "tasks", route: "/dashboard/tasks" },
  {
    label: "Cloud Storage",
    icon: Cloud,
    id: "storage",
    route: "/dashboard/storage",
  },
];

const UTILITY_NAV_ITEMS: NavItem[] = [
  {
    label: "Notifications",
    icon: Bell,
    id: "notifications",
    route: "/dashboard/notifications",
  },
  {
    label: "Feedback",
    icon: MessageSquare,
    id: "feedback",
    route: "/dashboard/feedback",
  },
  {
    label: "Settings",
    icon: Settings,
    id: "settings",
    route: "/dashboard/settings",
  },
];

const ICON_SIZE = 17;

function RailTooltip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null;
  return (
    <span
      role="tooltip"
      // Added !z-[9999] to guarantee it renders on top of everything on the page
      className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-neutral-900 dark:bg-neutral-700 px-2 py-1 text-[11px] font-medium text-white opacity-0 scale-95 origin-left transition-all duration-150 group-hover/btn:opacity-100 group-hover/btn:scale-100 !z-[9999] shadow-lg"
    >
      {label}
    </span>
  );
}

function NavLink({
  item,
  isActive,
  open,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  open: boolean;
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, route: string) => void;
}) {
  return (
    <a
      href={item.route}
      onClick={(e) => onNavigate(e, item.route)}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group/btn relative inline-flex items-center whitespace-nowrap rounded-xl text-sm outline-none cursor-pointer",
        "transition-[background-color,color,box-shadow] duration-150 ease-out",
        "focus-visible:ring-1 focus-visible:ring-ring",
        open
          ? "w-full justify-start px-3 h-10 gap-3"
          : "size-9 justify-center shrink-0 mx-auto",
        isActive
          ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
          : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-medium",
      )}
    >
      <item.icon
        size={ICON_SIZE}
        strokeWidth={isActive ? 2.5 : 2}
        className="shrink-0"
      />
      <span
        className={cn(
          "truncate text-[13px] transition-all duration-200 ease-out overflow-hidden",
          open ? "opacity-100 max-w-[10rem]" : "opacity-0 max-w-0 w-0",
        )}
      >
        {item.label}
      </span>
      <RailTooltip label={item.label} show={!open} />
    </a>
  );
}

const NavigationRail = () => {
  const { open, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = user?.full_name || user?.username || "Your Account";
  const userInitial =
    displayName !== "Your Account" ? displayName.charAt(0).toUpperCase() : null;

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    route: string,
  ) => {
    e.preventDefault();
    navigate(route);
  };

  return (
    <Sidebar
      collapsible="icon"
      // Added !z-[100] and !overflow-visible to prevent the main dashboard layout from covering the popups
      className="!z-[100] h-full border border-black/5 dark:border-white/10 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl flex flex-col transition-[width] duration-200 ease-out rounded-2xl shadow-sm !overflow-visible"
    >
      <SidebarHeader
        // Added !overflow-visible to punch through Shadcn's internal Header wrapper constraints
        className={cn(
          "mt-3 mb-2 flex flex-col w-full shrink-0 transition-all duration-200 ease-out !overflow-visible",
          open ? "px-4" : "px-0 items-center",
        )}
      >
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(
            // Added !overflow-visible directly to the button
            "group/btn relative !overflow-visible border-0 transition-all duration-200 ease-out hover:bg-black/5 dark:hover:bg-white/5 flex items-center p-0",
            open
              ? "w-full h-12 rounded-xl px-2 gap-3 justify-start"
              : "size-10 rounded-full justify-center shadow-xs mx-auto",
          )}
        >
          <div className="shrink-0 size-8 overflow-hidden flex items-center justify-center">
            <img
              src="/pic.png"
              alt="logo"
              className="h-full w-full object-cover rounded-md"
            />
          </div>
          <span
            className={cn(
              "font-bold text-lg tracking-tight text-foreground truncate transition-all duration-200 ease-out overflow-hidden",
              open ? "opacity-100 max-w-[10rem]" : "opacity-0 max-w-0 w-0",
            )}
          >
            My Stuff
          </span>
          <RailTooltip label="Expand sidebar" show={!open} />
        </Button>
      </SidebarHeader>

      <SidebarContent
        className={cn(
          "flex flex-col gap-1 mt-2 w-full scrollbar-none transition-all duration-200 ease-out",
          open ? "px-3 overflow-y-auto" : "px-0 items-center !overflow-visible",
        )}
      >
        {MAIN_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            open={open}
            isActive={location.pathname === item.route}
            onNavigate={handleNavClick}
          />
        ))}
      </SidebarContent>

      <SidebarFooter
        // Added !overflow-visible to punch through Shadcn's internal Footer wrapper constraints
        className={cn(
          "flex flex-col gap-1 mb-4 w-full shrink-0 transition-all duration-200 ease-out !overflow-visible",
          open ? "px-3" : "px-0 items-center",
        )}
      >
        {UTILITY_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            open={open}
            isActive={location.pathname === item.route}
            onNavigate={handleNavClick}
          />
        ))}

        <div
          className={cn(
            "h-px bg-border my-1 rounded-full transition-all duration-200 ease-out",
            open ? "w-full" : "w-6 mx-auto",
          )}
        />

        <Button
          variant="ghost"
          aria-label={displayName}
          className={cn(
            // Added !overflow-visible directly to the button
            "group/btn relative !overflow-visible rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground hover:text-foreground mt-1 transition-all duration-200 ease-out p-0",
            open
              ? "w-full h-11 justify-start px-2 gap-2.5 rounded-xl"
              : "size-9 justify-center shrink-0 mx-auto",
          )}
        >
          <div className="shrink-0 size-[30px] rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs text-foreground uppercase overflow-hidden">
            {userInitial ? userInitial : <User size={14} strokeWidth={2.5} />}
          </div>
          <div
            className={cn(
              "flex flex-col items-start truncate text-left select-none leading-tight transition-all duration-200 ease-out overflow-hidden",
              open ? "opacity-100 max-w-[10rem]" : "opacity-0 max-w-0 w-0",
            )}
          >
            <span className="text-xs font-semibold text-foreground truncate w-full">
              {displayName}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground truncate w-full">
              {user?.email || "Free Plan"}
            </span>
          </div>
          <RailTooltip label={displayName} show={!open} />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default NavigationRail;
