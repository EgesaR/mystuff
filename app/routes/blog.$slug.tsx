import { Link, useLoaderData } from "react-router";
import ReactMarkdown from "react-markdown";

import type { Route } from "./+types/blog.$slug";
import SiteHeader from "~/features/site/components/SiteHeader";
import SiteFooter from "~/features/site/components/SiteFooter";
import { buildMeta, jsonLd, SITE_URL } from "~/lib/seo";
import { apiFetch } from "~/lib/api";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  published_at: string | null;
  author: { id: string; username: string };
  created_at: string;
  updated_at: string;
}

type BlogPostLoaderData = Awaited<ReturnType<typeof loader>>;

export async function loader({ params }: Route.LoaderArgs) {
  const post = await apiFetch<BlogPost>(`/blog/${params.slug}`);
  return { post };
}

export const meta: Route.MetaFunction = ({ matches }) => {
  const currentMatch = matches.find(
    (match) => match?.id === "routes/blog.$slug",
  );

  const data = currentMatch?.loaderData as BlogPostLoaderData | undefined;

  return buildMeta({
    title: data?.post.title ?? "Blog",
    description: data?.post.excerpt ?? "A post from the My Stuff blog.",
    path: `/blog/${data?.post.slug ?? ""}`,
    image: data?.post.cover_image_url ?? undefined,
    type: "article",
    keywords: data?.post.tags,
  });
};

const BlogPost = () => {
  const { post } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#F2F1EC] text-[#1C2321]">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.cover_image_url ?? undefined,
          datePublished: post.published_at ?? undefined,
          dateModified: post.updated_at,
          author: { "@type": "Person", name: post.author.username },
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        })}
      />

      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/blog"
          className="font-mono text-xs uppercase tracking-[0.14em] text-[#2F5D50]"
        >
          ← All posts
        </Link>

        <div className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-[#8A8676]">
          {post.published_at ? (
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          ) : null}
          <span>·</span>
          <span>{post.author.username}</span>
        </div>

        <h1
          className="mt-3 text-4xl text-[#1C2321] sm:text-5xl"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {post.title}
        </h1>

        {post.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[#2F5D50]">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-[#C9C4B7] px-2 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Requires @tailwindcss/typography for the `prose` utility classes */}
        <article className="prose prose-neutral mt-10 max-w-none prose-headings:font-serif prose-a:text-[#2F5D50]">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
};

export default BlogPost;
