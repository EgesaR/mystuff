import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import styles from "./tailwind.css?url"; // Use ?url for Vite compatibility
import SideBar from "./components/SideBar";
import AppBar from "./components/AppBar";
import { useState } from "react";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
          <AppBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <div className="w-full h-[92%] flex relative">
            {/* Sidebar: Hidden on mobile, visible on larger screens */}
            <div
              className={`fixed inset-y-0 left-0 z-20 transform transition-transform duration-300 ease-in-out md:static md:transform-none md:w-64 lg:w-72 bg-gray-800 ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } md:translate-x-0 h-[92%] md:h-full`}
            >
              <SideBar />
            </div>

            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                onClick={toggleSidebar}
              />
            )}

            {/* Main Content */}
            <div
              className={`w-full h-full overflow-y-auto transition-all duration-300 md:ml-0 ${
                isSidebarOpen ? "ml-64" : "ml-0"
              } md:w-[calc(100%-16rem)] lg:w-[calc(100%-18rem)]`}
            >
              {children}
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
