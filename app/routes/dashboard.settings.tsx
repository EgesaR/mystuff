// app/routes/dashboard.settings.tsx
import { Outlet, NavLink } from "react-router";
import { User, Palette, Shield } from "lucide-react";
import { cn } from "~/lib/utils";

const SETTINGS_LINKS = [
  { name: "Account", path: "/dashboard/settings/account", icon: User },
  { name: "Appearance", path: "/dashboard/settings/appearance", icon: Palette },
  { name: "Security", path: "/dashboard/settings/security", icon: Shield },
];

export default function SettingsLayout() {
  return (
    <div className="w-full h-full flex flex-col py-8 px-8 gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your preferences and account details.
        </p>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        <aside className="w-52 shrink-0">
          <nav className="flex flex-col gap-1">
            {SETTINGS_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground",
                  )
                }
              >
                <link.icon size={16} className="shrink-0" />
                {link.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
