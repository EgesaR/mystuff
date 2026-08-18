import React from "react";
import { motion, type Variants } from "framer-motion";
import { useAuth } from "~/hooks/useAuth";
import { CheckSquare, Clock, Cloud, StickyNote } from "lucide-react";
import { Button } from "~/components/ui/button";
import { NavLink } from "react-router";

// Explicitly type as Variants to resolve TS errors
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const DashboardIndex = () => {
  const { user } = useAuth();

  // Safely extract the best first name to use
  const bestName = user?.full_name || user?.username || "there";
  const firstName = bestName.split(" ")[0];

  return (
    <div className="w-full h-full flex flex-col py-8 px-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8"
      >
        {/* Header Section */}
        <motion.div variants={item} className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Good morning, {firstName}.
          </h1>
          <p className="text-muted-foreground text-sm">
            Here is an overview of your workspace today.
          </p>
        </motion.div>

        {/* Quick Actions / Stats Grid */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Card 1: Notes */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <StickyNote size={18} />
              </div>
              <span className="font-medium text-sm">Recent Notes</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-start">
              <span className="text-2xl font-semibold text-foreground">12</span>
              <span className="text-xs text-muted-foreground">
                Active documents
              </span>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full text-xs h-8 rounded-xl"
            >
              <NavLink to="/dashboard/notes">Open Notes</NavLink>
            </Button>
          </div>

          {/* Card 2: Tasks */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <CheckSquare size={18} />
              </div>
              <span className="font-medium text-sm">Pending Tasks</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-start">
              <span className="text-2xl font-semibold text-foreground">5</span>
              <span className="text-xs text-muted-foreground">
                Due this week
              </span>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full text-xs h-8 rounded-xl"
            >
              <NavLink to="/dashboard/tasks">View Tasks</NavLink>
            </Button>
          </div>

          {/* Card 3: Storage */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <Cloud size={18} />
              </div>
              <span className="font-medium text-sm">Cloud Storage</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-start">
              <span className="text-2xl font-semibold text-foreground">
                45%
              </span>
              <span className="text-xs text-muted-foreground">
                4.5 GB of 10 GB used
              </span>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full text-xs h-8 rounded-xl"
            >
              <NavLink to="/dashboard/storage">Manage Storage</NavLink>
            </Button>
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div variants={item} className="mt-4 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground" />
            Recent Activity
          </h3>
          <div className="bg-card border border-border/50 rounded-2xl p-1 shadow-sm overflow-hidden flex flex-col">
            {/* Placeholder empty state */}
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <span className="text-sm text-muted-foreground">
                No recent activity to show yet. Check back later!
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardIndex;
