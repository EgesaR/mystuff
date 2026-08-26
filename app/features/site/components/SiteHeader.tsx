import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useAuth } from "~/features/auth/hooks/useAuth";
import App from "../../../root";

const NAV_ITEMS: {
  label: string;
  href: `/${string}`;
}[] = [
  { label: "About", href: "/about" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const SiteHeader = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link to="/" className="flex items-baseline gap-2 transition-opacity hover:opacity-80">
          <span
            className="text-xl italic tracking-tight"
            style={{
              fontFamily: "'Fraunces', serif",
            }}
          >
            My Stuff
          </span>

          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-primary sm:inline">
            catalog v1
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-end gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active =
              location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-t-md border border-b-0 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "border-border bg-background text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}

                {active && (
                  <motion.span
                    layoutId="active-nav-tab"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                    className="absolute inset-x-0 -bottom-px h-px bg-background"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button asChild className="rounded-sm font-mono text-xs uppercase tracking-[0.14em]">
              <Link to="/dashboard">Open App</Link>
            </Button>
          ) : (
            <>
              <Button
                variant={"ghost"}
                asChild
                className="rounded-sm font-mono text-xs uppercase tracking-[0.14em]"
              >
                <Link to={"/auth/login"}>Sign in</Link>
              </Button>

              <Button asChild className="rounded-sm font-mono text-xs uppercase tracking-[0.14em]">
                <Link to={"/auth/login"}>Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      <nav
        className="flex gap-5 overflow-x-auto border-t px-6 py-2 font-mono text-xs uppercase tracking-[0.14em] md:hidden"
        aria-label="Mobile primary"
      >
        {NAV_ITEMS.map((item) => {
          const active =
            location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap transition-colors",
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};

export default SiteHeader;
