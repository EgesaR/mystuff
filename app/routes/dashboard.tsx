import React from "react";
import { useLoaderData, Link } from "react-router";
import { motion } from "framer-motion";
import { Construction, Sparkles, ArrowLeft, Hammer, Code2 } from "lucide-react";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AuthProvider } from "~/features/auth/providers/AuthProviders";
import { requireUser } from "~/features/auth/api";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUser(request);
}

const DashboardLayout = () => {
  const { user, token } = useLoaderData<typeof loader>();

  return (
    <AuthProvider initialUser={user} initialToken={token}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "14rem",
            "--sidebar-width-icon": "3rem",
            "--sidebar-width-mobile": "20rem",
          } as React.CSSProperties
        }
      >
        <div className="flex h-screen w-full items-center justify-center bg-neutral-200/40 p-4 dark:bg-neutral-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg"
          >
            <Card className="relative overflow-hidden border border-border/80 bg-card/90 shadow-2xl backdrop-blur-md">
              {/* Background Accent Gradients */}
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 size-40 rounded-full bg-amber-500/10 blur-3xl" />

              <CardContent className="relative flex flex-col items-center p-8 text-center space-y-6">
                {/* Status Badge */}
                <Badge
                  variant="outline"
                  className="gap-2 border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400"
                >
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                  </span>
                  Work In Progress
                </Badge>

                {/* Animated Icon Circle */}
                <motion.div
                  initial={{ rotate: -15, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="relative flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner"
                >
                  <Construction className="size-10" />
                  <motion.div
                    animate={{ rotate: [0, 20, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute -right-2 -top-2 rounded-lg bg-background p-1.5 text-amber-500 shadow-md border border-border"
                  >
                    <Hammer className="size-4" />
                  </motion.div>
                </motion.div>

                {/* Main Heading & Content */}
                <div className="space-y-2 max-w-sm">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Dashboard Under Development
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We're building something great for you,{" "}
                    <span className="font-semibold text-foreground">
                      {user?.name || user?.email || "User"}
                    </span>
                    . Key analytics and tools will be available soon.
                  </p>
                </div>

                {/* Feature Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/50">
                    <Code2 className="size-3.5 text-primary" /> Active Sprint
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/50">
                    <Sparkles className="size-3.5 text-amber-500" /> New UI Modules
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-2 pt-2">
                  <Button asChild className="w-full gap-2 shadow-sm">
                    <Link to="/">
                      <ArrowLeft className="size-4" />
                      Return Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default DashboardLayout;
