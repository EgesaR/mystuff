// app/routes/dashboard.settings.tsx
import { Outlet, NavLink } from "react-router";
import { User, Palette, Shield } from "lucide-react";

export default function SettingsLayout() {
  const settingsLinks = [
    { name: "Account", path: "/dashboard/settings/account", icon: User },
    {
      name: "Appearance",
      path: "/dashboard/settings/appearance",
      icon: Palette,
    },
    { name: "Security", path: "/dashboard/settings/security", icon: Shield },
  ];

  return (
    // This wrapper ensures Settings has its own 2-column feel
    <div className="flex h-full w-full gap-8 p-6 max-w-5xl mx-auto">
      {/* Settings Navigation (Sub-Sidebar) */}
      <aside className="w-48 flex-shrink-0">
        <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-4">
          Settings
        </h3>
        <nav className="flex flex-col gap-1">
          {settingsLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400"
                }`
              }
            >
              <div className="flex items-center gap-2">
                <link.icon size={16} />
                {link.name}
              </div>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Settings Content Area */}
      <main className="flex-1">
        {/* This Outlet renders the specific setting page (Account, Security, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}
