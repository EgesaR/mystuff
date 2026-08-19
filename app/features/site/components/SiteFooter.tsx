import React from "react";
import { Link } from "react-router";

const FOOTER_LINKS: { label: string; href: `/${string}` }[] = [
  { label: "About", href: "/about" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const SiteFooter = () => {
  return (
    <footer className="border-t border-[#C9C4B7] bg-[#F2F1EC]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p
            className="text-lg italic text-[#1C2321]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            My Stuff
          </p>
          <p className="mt-1 max-w-xs text-sm text-[#5B5A50]">
            One place to file notes, files, and everything in between - indexed,
            searchable, and yours.
          </p>
        </div>

        <nav
          className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[#5B5A50]"
          aria-label="Footer"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="hover:text-[#1C2321]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-[#C9C4B7] px-6 py-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[#8A8676]">
        &copy; {new Date().getFullYear()} My Stuff - Filled, not forgotten.
      </div>
    </footer>
  );
};

export default SiteFooter;
