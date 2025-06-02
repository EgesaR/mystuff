import React, { useState, useEffect, useCallback } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import AppBar from "~/components/AppBar";
import SideBar from "~/components/SideBar";
import styles from "./tailwind.css?url";
import { useIsMobile } from "~/hooks/useIsMobile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WelcomeDialog from "./components/WelcomeDialog";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const getInitialSidebarOpen = () =>
    typeof window !== "undefined" && window.innerWidth >= 640;
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarOpen());
  const [hasInteracted, setHasInteracted] = useState(false);

  const toggleSidebar = useCallback(() => {
    setHasInteracted(true);
    setSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!hasInteracted) {
      setSidebarOpen(!isMobile);
    }
  }, [isMobile, hasInteracted]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="w-full h-screen overflow-hidden font-inter bg-zinc-950">
       
        <style>
          {`
            :root {
              --sidebar-width: 280px;
              --sidebar-mobile-width: 75vw;
              --appbar-height: 4rem;
            }

            @media (max-width: 640px) {
              .sidebar-hidden {
                transform: translateX(-100%);
                opacity: 0;
                visibility: hidden;
              }
              .sidebar-visible {
                transform: translateX(0);
                opacity: 1;
                visibility: visible;
              }
            }

            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #3f3f46;
              border-radius: 9999px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #71717a;
              border-radius: 9999px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #a1a1aa;
            }
          `}
        </style>
        <QueryClientProvider client={queryClient}>
          <div className="h-full w-full overflow-hidden transition-all duration-300 ease-in-out">
            <AppBar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
            <div className="w-full h-[calc(100%-var(--appbar-height))] flex relative gap-0 sm:gap-4">
              <SideBar
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                className={
                  isMobile
                    ? sidebarOpen
                      ? "sidebar-visible"
                      : "sidebar-hidden"
                    : ""
                }
              />
              <main
                className={`h-full bg-zinc-900 sm:rounded-t-2xl min-w-0 transition-all duration-300 ease-in-out custom-scrollbar ${
                  isMobile && sidebarOpen
                    ? "opacity-50 pointer-events-none flex-1"
                    : "flex-1"
                }`}
              >
                <div className="h-full overflow-y-auto pr-4 sm:pr-3">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <ScrollRestoration />
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
