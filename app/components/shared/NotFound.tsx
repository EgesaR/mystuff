// app/components/ui/NotFound.tsx
import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Home, ArrowLeft, Ghost } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine context based on URL prefix
  const isDashboard = location.pathname.startsWith("/dashboard");
  const homePath = isDashboard ? "/dashboard" : "/";
  const homeLabel = isDashboard ? "Back to Dashboard" : "Back to Home";

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center max-w-md"
      >
        {/* Floating Ghost Animation */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mb-8 p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-full text-muted-foreground"
        >
          <Ghost size={64} strokeWidth={1.5} />
        </motion.div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Page not found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page{" "}
          <span className="font-mono text-xs bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded">
            {location.pathname}
          </span>{" "}
          doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2 rounded-xl h-11 px-6"
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>

          <Button
            asChild
            className="gap-2 rounded-xl h-11 px-6 bg-foreground text-background hover:bg-foreground/90"
          >
            <Link to={homePath}>
              <Home size={16} />
              {homeLabel}
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
