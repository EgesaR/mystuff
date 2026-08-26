import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import appStyles from "~/app.css?url";

import NotFound from "./components/shared/NotFound";
import { Toaster } from "~/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { useServerWakeup } from "~/hooks/useServerWakeup";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./features/auth/providers/AuthProviders";
import { UploadProvider } from "./providers/UploadProvider";

export const links: Route.LinksFunction = () => [
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=IBM+Plex+Mono:wght@400;500&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  useServerWakeup();

  const modernStylesheet = JSON.stringify(appStyles);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta
          name="google-site-verification"
          content="ERwMq3r779g9QA9E8wXcHEuiIylCdZ_OnZ3wR3fUksY"
        />

        {/*
         * iOS 12:
         *   /legacy.css
         *
         * Modern browsers:
         *   Tailwind 4 app.css
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var ua = navigator.userAgent || "";

                var isLegacyIOS =
                  /iPad|iPhone|iPod/.test(ua) &&
                  /OS 12_/.test(ua);

                document.documentElement.classList.toggle(
                  "legacy-ios",
                  isLegacyIOS
                );

                var link = document.createElement("link");

                link.rel = "stylesheet";

                link.href = isLegacyIOS
                  ? "/legacy.css"
                  : ${modernStylesheet};

                link.setAttribute(
                  "data-app-styles",
                  isLegacyIOS ? "legacy" : "modern"
                );

                document.head.appendChild(link);
              })();
            `,
          }}
        />

        <Meta />
        <Links />

        {/*
         * Apply the saved theme before the application renders.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme =
                  localStorage.getItem("my-stuff-theme") || "system";

                var resolved =
                  theme === "system"
                    ? (
                        window.matchMedia(
                          "(prefers-color-scheme: dark)"
                        ).matches
                          ? "dark"
                          : "light"
                      )
                    : theme;

                document.documentElement.classList.toggle(
                  "dark",
                  resolved === "dark"
                );
              } catch {}
            `,
          }}
        />
      </head>

      <body>
        {children}

        <Analytics />

        <ScrollRestoration />

        <Scripts />

        <Toaster position="top-right" richColors closeButton duration={3000} />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UploadProvider>
          <Outlet />
        </UploadProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="w-full h-screen flex items-center justify-center">
        <NotFound />
      </main>
    );
  }

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = "Error";
    details = error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-destructive">
        <h1 className="text-3xl font-bold mb-2">{message}</h1>

        <p className="font-medium text-destructive/80 mb-6">{details}</p>

        {stack && (
          <div className="bg-neutral-950 rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs text-neutral-300 font-mono">
              <code>{stack}</code>
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
