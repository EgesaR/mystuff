import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router";
import { useTabs } from "~/context/TabContext";
import { cn } from "~/lib/utils";

const contentVariants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.99,
    filter: "blur(3px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 420,
      damping: 32,
      mass: 0.7,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.99,
    filter: "blur(2px)",
    transition: {
      duration: 0.12,
      ease: "easeIn" as const,
    },
  },
};

export function TabPanel() {
  const location = useLocation();
  const { getActiveTab } = useTabs();
  const activeTab = getActiveTab();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background relative min-h-0 rounded-2xl border-l border-t border-border/40 shadow-sm">
      {/* Page content */}
      <div className="flex-1 overflow-auto p-2 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Status Bar at Bottom Right */}
      {activeTab && (
        <div className="absolute bottom-5 right-5 z-50 pointer-events-none">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-background/80 backdrop-blur-md shadow-sm pointer-events-auto"
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                activeTab.status === "loading" && "bg-amber-400 animate-pulse",
                activeTab.status === "error" && "bg-red-500",
                activeTab.status === "success" && "bg-emerald-500",
                activeTab.status === "idle" && "bg-muted-foreground/30",
              )}
            />
            <span className="text-[10px] font-semibold text-foreground">
              {activeTab.title}
            </span>
            <div className="h-3 w-px bg-border/60" />
            <span className="text-[10px] text-muted-foreground font-mono tracking-tight max-w-35 truncate">
              {activeTab.url}
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
