import React from "react";
import { href, Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";

const NAV_ITEMS: { label: string; href: `/${string}` }[] = [
  { label: "About", href: "/about" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

const SiteHeader = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-[#C9C4B7] bg-[#F2F1EC]/90 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span
            className="text-xl italic text-[#1C2321]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            My Stuff
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-[#2F5D50] sm:inline">
            catalog v1
          </span>
        </Link>

        {/* Desktop nav - rendered as folder tabs sitting on header's bottom rule */}
        <nav className="hidden items-end gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative rounded-t-md border border-b-0 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "border-[#C9C4B7] bg-[#F2F1EC] text-[#1C2321]"
                    : "border-transparent text-[#5B5A50] hover:text-[#1C2321]"
                }`}
              >
                {item.label}
                {active ? (
                  <motion.span
                    layoutId="active-nav-tab"
                    className="absolute inset-x-0 -bottom-px h-px bg-[#F2F1EC]"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="rounded-sm bg-[#2F5D50] font-mono text-xs uppercase tracking-[0.14em] text-[#F2F1EC] hover:bg-[#26493F]"
          >
            <Link to={"/auth/login"}>Open app</Link>
          </Button>
        </div>
      </div>

      {/* Mobile nav - simple scrollable row, folder-tab styling dropped for space*/}
      <nav className="flex gap-5 overflow-x-auto border-t border-[#C9C4B7] px-6 py-2 font-mono text-xs uppercase tracking-[0.14em] md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap ${active ? "text-[#1C2321]" : "text-[#5B5A50]"}`}
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
