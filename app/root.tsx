import React, { useState, useEffect } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import AppBar from "~/components/AppBar";
import SideBar from "~/components/SideBar";
import styles from "./tailwind.css?url";
import { useIsMobile } from "~/hooks/useIsMobile";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Only set sidebarOpen on initial render or mode change, unless user has interacted
    if (!hasInteracted) {
      setSidebarOpen(!isMobile);
    }
  }, [isMobile, hasInteracted]);

  const toggleSidebar = () => {
    setHasInteracted(true);
    setSidebarOpen((prev) => !prev);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="w-full h-screen overflow-hidden">
        <div className="h-full w-full overflow-hidden">
          <AppBar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
          <div className="w-full h-[90%] flex relative pr-4 gap-4">
            <SideBar
              toggleSidebar={toggleSidebar}
              sidebarOpen={sidebarOpen}
              isMobile={isMobile}
            />
            <div
              className={`h-full bg-zinc-900 sm:rounded-t-2xl sm:pr-3 min-w-0 ${
                isMobile && !sidebarOpen ? "w-full" : "flex-1"
              }`}
            >
              <div className="h-full overflow-y-auto sm:pr-4 scrollbar-thin [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-red-600 [&::-webkit-scrollbar-thumb]:bg-blue-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                {children}
              </div>
            </div>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}