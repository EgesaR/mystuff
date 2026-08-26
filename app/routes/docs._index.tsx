import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/docs";

import { ArrowRight, FileText } from "lucide-react";

import { buildMeta } from "~/lib/seo";

import { Card, CardContent } from "~/components/ui/card";

interface DocPageSummary {
  id: string;
  slug: string;
  category: string;
  title: string;
  order: number;
}

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Documentation",
    description:
      "Documentation for My Stuff — learn how to use notes, files, collections, sharing, and the My Stuff API.",
    path: "/docs",
  });

const Docs = () => {
  const { grouped } = useOutletContext<{
    grouped: Record<string, DocPageSummary[]>;
  }>();

  const quickLinks = Object.values(grouped)
    .flat()
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  const categoryCount = Object.keys(grouped).length;

  return (
    <div className='max-w-5xl'>
      {/* Hero */}
      <section className='rounded-2xl border bg-muted/30 px-6 py-12 sm:px-10 sm:py-16'>
        <div className='mx-auto max-w-3xl'>
          <p className='text-xs font-medium uppercase tracking-[0.18em] text-primary'>
            My Stuff Documentation
          </p>

          <h1 className='mt-4 text-3xl font-bold tracking-tight sm:text-5xl'>
            Everything you need to get started.
          </h1>

          <p className='mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg'>
            Learn how to use My Stuff, organize your workspace, manage your
            files and notes, collaborate with others, and work with the platform
            API.
          </p>

          <div className='mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
            <span>
              {categoryCount} {categoryCount === 1 ? "category" : "categories"}
            </span>

            <span aria-hidden='true'>·</span>

            <span>{quickLinks.length} quick links</span>
          </div>
        </div>
      </section>

      {/* Quick links */}
      {quickLinks.length > 0 && (
        <section className='mt-12'>
          <div className='mb-6'>
            <h2 className='text-xl font-semibold tracking-tight'>
              Quick links
            </h2>

            <p className='mt-1 text-sm text-muted-foreground'>
              Start with one of the most useful pages.
            </p>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {quickLinks.map((page) => (
              <Link key={page.id} to={`/docs/${page.slug}`} className='group'>
                <Card className='h-full transition-colors hover:bg-accent hover:text-accent-foreground'>
                  <CardContent className='flex h-full flex-col p-5'>
                    <div className='mb-5 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground'>
                      <FileText className='size-5' />
                    </div>

                    <h3 className='font-semibold tracking-tight'>
                      {page.title}
                    </h3>

                    <p className='mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground'>
                      Learn more in the {page.category} section.
                    </p>

                    <div className='mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary'>
                      Read documentation
                      <ArrowRight className='size-3.5 transition-transform group-hover:translate-x-0.5' />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Docs;
