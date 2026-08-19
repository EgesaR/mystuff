import React from "react";
import type { Route } from "./+types/docs";
import { buildMeta } from "~/lib/seo";
import { apiFetch } from "~/lib/api";
import { Link, useLoaderData } from "react-router";
import SiteHeader from "~/features/site/components/SiteHeader";
import SiteFooter from "~/features/site/components/SiteFooter";

interface DocPageSummary {
  id: string;
  slug: string;
  category: string;
  title: string;
  order: number;
}

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Docs",
    description:
      "Documentation for My Stuff — setup, the notes editor, file storage, sharing, and the API that powers all of it.",
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

const Docs = () => {
  const { grouped } = useLoaderData<typeof loader>();
  const categories = Object.entries(grouped);

  return (
    <div className="min-h-screen bg-[#F2F1EC] text-[#1C2321]">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F5D50]">
          Documentation
        </p>
        <h1
          className="mt-4 text-4xl text-[#1C2321] sm:text-5xl"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Everything, indexed.
        </h1>

        {categories.length === 0 ? (
          <p className="mt-10 text-[#5B5A50]">
            Docs are being written. Check back shortly, or{" "}
            <Link
              to="/contact"
              className="text-[#2F5D50] underline underline-offset-2"
            >
              ask a question directly
            </Link>
            .
          </p>
        ) : (
          <div className="mt-12 space-y-10">
            {categories.map(([category, pages]) => (
              <div key={category}>
                <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-[#8A8676]">
                  {category}
                </h2>
                <ul className="mt-3 divide-y divide-[#C9C4B7] rounded-sm border border-[#C9C4B7] bg-[#F8F7F2]">
                  {pages
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((page) => (
                      <li key={page.id}>
                        <Link
                          to={`/docs/${page.slug}`}
                          className="flex items-center justify-between px-5 py-4 text-[#1C2321] hover:bg-[#EDEBE1]"
                        >
                          <span>{page.title}</span>
                          <span className="font-mono text-xs text-[#8A8676]">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Docs;
