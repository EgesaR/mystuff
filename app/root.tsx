import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import NotFound from "./components/shared/NotFound";

export const links: Route.LinksFunction = () => [
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
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('my-stuff-theme') || 'system';
                const resolved = theme === 'system'
                  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                  : theme;
                document.documentElement.classList.toggle('dark', resolved === 'dark');
              } catch {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // If it's a 404 thrown via a loader/action, use our beautiful component
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <main className="w-full h-screen flex items-center justify-center">
        <NotFound />
      </main>
    );
  }

  // Otherwise, handle 500s and unexpected crashes
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
