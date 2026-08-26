import { Link, Outlet, useLoaderData, useLocation } from "react-router";

import { Search } from "lucide-react";

import SiteFooter from "~/features/site/components/SiteFooter";
import SiteHeader from "~/features/site/components/SiteHeader";

import { apiFetch } from "~/lib/api/server";
import { buildMeta } from "~/lib/seo";
import { cn } from "~/lib/utils";

interface DocPageSummary {
  id: string;
  slug: string;
  category: string;
  title: string;
  order: number;
}

export const meta = () =>
  buildMeta({
    title: "Docs",
    description:
      "Documentation for My Stuff - setup, the note editor, file storage, and the API.",
    path: "/docs",
  });

export async function loader() {
  const pages = await apiFetch<DocPageSummary[]>("/docs");

  const grouped = pages.reduce<Record<string, DocPageSummary[]>>(
    (acc, page) => {
      (acc[page.category] ??= []).push(page);
      return acc;
    },
    {},
  );

  return { grouped };
}

const DocsLayout = () => {
  const { grouped } = useLoaderData<typeof loader>();
  const location = useLocation();

  const categories = Object.entries(grouped);

  return (
    <div className='flex min-h-screen flex-col bg-background font-sans text-foreground'>
      <SiteHeader />

      <div className='mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8'>
        {/* Sidebar */}
        <aside className='hidden w-64 shrink-0 border-r py-8 pr-6 lg:block'>
          {/* Search */}
          <div className='mb-8'>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />

              <input
                type='search'
                placeholder='Search...'
                className={cn(
                  "h-9 w-full rounded-md border bg-background",
                  "pl-9 pr-14 text-sm text-foreground",
                  "placeholder:text-muted-foreground",
                  "outline-none transition-colors",
                  "focus:border-ring focus:ring-2 focus:ring-ring/20",
                )}
              />

              <kbd className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground'>
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Navigation */}
          <nav className='space-y-8'>
            {categories.map(([category, pages]) => (
              <div key={category}>
                <h3 className='mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  {category}
                </h3>

                <ul className='space-y-1'>
                  {pages
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((page) => {
                      const isActive =
                        location.pathname === `/docs/${page.slug}`;

                      return (
                        <li key={page.id}>
                          <Link
                            to={`/docs/${page.slug}`}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-accent font-medium text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                            )}
                          >
                            {page.title}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className='min-w-0 flex-1 py-8 sm:py-10 lg:pl-12'>
          <Outlet context={{ grouped }} />
        </main>
      </div>

      <SiteFooter />
    </div>
  );
};

export default DocsLayout;
