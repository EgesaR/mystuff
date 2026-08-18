// routes/dashboard.settings.appearance.tsx
import { motion, type Variants } from "framer-motion";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "~/context/ThemeProvider";
import { cn } from "~/lib/utils";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-2xl"
    >
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how My Stuff looks on this device.
        </p>
      </motion.div>

      <motion.div
        variants={item}
        className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm"
      >
        <div className="grid grid-cols-3 gap-3">
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
      </motion.div>
    </motion.div>
  );
}
