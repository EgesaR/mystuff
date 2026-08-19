import React from "react";
import type { Route } from "./+types/blog._index";
import { buildMeta } from "~/lib/seo";
import { apiFetch } from "~/lib/api";
import SiteFooter from "~/features/site/components/SiteFooter";
import { Link, useLoaderData } from "react-router";
import SiteHeader from "~/features/site/components/SiteHeader";

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  tags: string[];
  published_at: string | null;
}

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Blog",
    description:
      "Notes on building My Stuff — architecture decisions, features shipped, and what changed along the way.",
    path: "/blog",
  });

export async function loader() {
  const posts = await apiFetch<BlogPostSummary[]>("/blog");
  return { posts };
}

const BlogIndex = () => {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#F2F1EC] text-[#1C2321]">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F5D50]">
          Blog
        </p>
        <h1
          className="mt-4 text-4xl text-[#1C2321] sm:text-5xl"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Field notes from building this.
        </h1>

        {posts.length === 0 ? (
          <p className="mt-10 text-[#5B5A50]">
            Nothing published yet — first post is on the way.
          </p>
        ) : (
          <div className="mt-12 divide-y divide-[#C9C4B7] border-y border-[#C9C4B7]">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="block py-8 first:pt-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-[#8A8676]">
                  {post.published_at ? (
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  ) : null}
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
                <h2
                  className="mt-3 text-2xl text-[#1C2321]"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {post.title}
                </h2>
                <p className="mt-2 max-w-2xl text-[#5B5A50]">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default BlogIndex;
