// app/routes/dashboard.settings._index.tsx
import { Link } from "react-router";
import { motion, type Variants } from "framer-motion";
import { User, Shield, Palette, type LucideIcon } from "lucide-react";
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

interface SettingsLink {
  title: string;
  desc: string;
  icon: LucideIcon;
  path: string;
  tint: string;
}

// Same tint palette as the Dashboard home cards (blue for the "notes-like"
// personal item, purple for the "storage-like" appearance item, emerald
// for the "tasks-like" security item) — keeps the two pages visually related.
const LINKS: SettingsLink[] = [
  {
    title: "Account",
    desc: "Manage your personal information",
    icon: User,
    path: "/dashboard/settings/account",
    tint: "text-blue-500 bg-blue-500/10",
  },
  {
    title: "Appearance",
    desc: "Customize your workspace theme",
    icon: Palette,
    path: "/dashboard/settings/appearance",
    tint: "text-purple-500 bg-purple-500/10",
  },
  {
    title: "Security",
    desc: "Manage sessions and passwords",
    icon: Shield,
    path: "/dashboard/settings/security",
    tint: "text-emerald-500 bg-emerald-500/10",
  },
];

export default function SettingsIndex() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <motion.div key={link.path} variants={item}>
            <Link to={link.path} className="block h-full">
              <div className="h-full bg-card border border-border/50 rounded-2xl p-5 shadow-sm transition-all hover:border-indigo-500/30 hover:shadow-md">
                <div
                  className={cn(
                    "size-9 rounded-lg flex items-center justify-center mb-3",
                    link.tint,
                  )}
                >
                  <Icon size={17} />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {link.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {link.desc}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
