import { Form, Link, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/admin.docs._index";
import { FileText, Plus } from "lucide-react";

import { apiFetch } from "~/lib/api/server";
import { buildMeta } from "~/lib/seo";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface DocPageSummary {
  id: string;
  slug: string;
  category: string;
  title: string;
  order: number;
}

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Manage Docs",
    description: "Developer docs admin.",
    path: "/admin/docs",
  });

export async function loader({ request }: Route.LoaderArgs) {
  const pages = await apiFetch<DocPageSummary[]>("/docs", {}, request);

  const grouped = pages.reduce<Record<string, DocPageSummary[]>>(
    (acc, page) => {
      (acc[page.category] ??= []).push(page);
      return acc;
    },
    {},
  );

  return { grouped };
}

export async function action({ request }: Route.ActionArgs) {
  const created = await apiFetch<{ id: string }>(
    "/docs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Untitled page",
        category: "Getting Started",
        content: "# Untitled page\n\nStart writing…",
        order: 0,
      }),
    },
    request,
  );

  return redirect(`/admin/docs/${created.id}`);
}

const AdminDocsIndex = () => {
  const { grouped } = useLoaderData<typeof loader>();

  const categories = Object.entries(grouped);

  const total = categories.reduce(
    (count, [, pages]) => count + pages.length,
    0,
  );

  return (
    <main className='min-h-full bg-background text-foreground'>
      <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12'>
        {/* Header */}
        <header className='flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <FileText className='size-4 text-muted-foreground' />

              <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                Developer
              </p>
            </div>

            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Documentation
              </h1>

              <p className='mt-1 text-sm text-muted-foreground'>
                Manage and organize your documentation.
              </p>
            </div>
          </div>

          <Form method='post'>
            <Button
              type='submit'
              size='sm'
              className='w-full gap-1.5 sm:w-auto'
            >
              <Plus className='size-4' />
              New page
            </Button>
          </Form>
        </header>

        {/* Stats */}
        <div className='mt-8 flex items-center gap-2 text-sm text-muted-foreground'>
          <span className='font-medium text-foreground'>{total}</span>
          {total === 1 ? "page" : "pages"}

          <span aria-hidden='true'>·</span>

          <span>
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}
          </span>
        </div>

        {/* Documentation */}
        <div className='mt-8 space-y-6'>
          {categories.length === 0 ? (
            <Card>
              <CardContent className='flex flex-col items-center justify-center px-6 py-12 text-center'>
                <div className='mb-4 flex size-10 items-center justify-center rounded-lg bg-muted'>
                  <FileText className='size-5 text-muted-foreground' />
                </div>

                <h2 className='text-sm font-semibold'>No documentation yet</h2>

                <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
                  Create your first documentation page to get started.
                </p>

                <Form method='post' className='mt-5'>
                  <Button type='submit' size='sm' className='gap-1.5'>
                    <Plus className='size-4' />
                    Create page
                  </Button>
                </Form>
              </CardContent>
            </Card>
          ) : (
            categories.map(([category, pages]) => {
              const sortedPages = pages
                .slice()
                .sort((a, b) => a.order - b.order);

              return (
                <Card key={category} className='overflow-hidden'>
                  <CardHeader className='border-b bg-muted/30 px-4 py-3 sm:px-5'>
                    <CardTitle className='text-sm font-semibold'>
                      {category}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className='p-0'>
                    <ul className='divide-y'>
                      {sortedPages.map((page) => (
                        <li key={page.id}>
                          <Link
                            to={`/admin/docs/${page.id}`}
                            className='group flex min-w-0 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent hover:text-accent-foreground sm:px-5'
                          >
                            <div className='flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground'>
                              <FileText className='size-4' />
                            </div>

                            <div className='min-w-0 flex-1'>
                              <p className='truncate text-sm font-medium'>
                                {page.title}
                              </p>

                              <p className='mt-0.5 truncate font-mono text-xs text-muted-foreground'>
                                /{page.slug}
                              </p>
                            </div>

                            <span className='hidden shrink-0 font-mono text-xs text-muted-foreground sm:block'>
                              #{page.order + 1}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminDocsIndex;
