// routes/dashboard.settings.appearance.tsx
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "~/context/ThemeProvider";
import { cn } from "~/lib/utils";

const OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how My Stuff looks on this device.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-md">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                active
                  ? "border-indigo-500/50 bg-indigo-500/5"
                  : "border-border/50 hover:border-border hover:bg-black/[0.02] dark:hover:bg-white/[0.02]",
              )}
            >
              {active && (
                <span className="absolute top-2 right-2 text-indigo-600 dark:text-indigo-400">
                  <Check size={14} />
                </span>
              )}
              <Icon size={20} className="text-muted-foreground" />
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
