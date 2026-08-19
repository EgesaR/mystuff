import { Link, useLoaderData } from "react-router";
import ReactMarkdown from "react-markdown";

import type { Route } from "./+types/docs.$slug";
import { buildMeta } from "~/lib/seo";
import { apiFetch } from "~/lib/api";
import SiteHeader from "~/features/site/components/SiteHeader";
import SiteFooter from "~/features/site/components/SiteFooter";

interface DocPage {
  id: string;
  slug: string;
  category: string;
  title: string;
  content: string;
  order: number;
  created_at: string;
  updated_at: string;
}

type DocsPageLoaderData = Awaited<ReturnType<typeof loader>>;

export async function loader({ params }: Route.LoaderArgs) {
  const page = await apiFetch<DocPage>(`/docs/${params.slug}`);
  return { page };
}

export const meta: Route.MetaFunction = ({ matches }) => {
  const currentMatch = matches.find(
    (match) => match?.id === "routes/docs.$slug",
  );

  console.log("current match", currentMatch);

  const page = currentMatch?.loaderData as DocsPageLoaderData | undefined;

  console.log("page: ", page);
  return buildMeta({
    title: page?.page.title ?? "Docs",
    description:
      page?.page.content.slice(0, 155).replace(/\n/g, " ") ??
      "My Stuff documentation.",
    path: page?.page.slug ? `/docs/${page.page.slug}` : "/docs",
  });
};

const DocsPage = () => {
  const { page } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#F2F1EC] text-[#1C2321]">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/docs"
          className="font-mono text-xs uppercase tracking-[0.14em] text-[#2F5D50]"
        >
          ← All docs
        </Link>

        <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-[#8A8676]">
          {page.category}
        </p>
        <h1
          className="mt-2 text-4xl text-[#1C2321]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {page.title}
        </h1>

        <article className="prose prose-neutral mt-10 max-w-none prose-headings:font-serif prose-a:text-[#2F5D50]">
          <ReactMarkdown>{page.content}</ReactMarkdown>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
};

export default DocsPage;
