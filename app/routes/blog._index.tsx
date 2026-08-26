import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/blog._index";

import { Search } from "lucide-react";

import { buildMeta } from "~/lib/seo";
import { apiFetch } from "~/lib/api/server";

import SiteFooter from "~/features/site/components/SiteFooter";
import SiteHeader from "~/features/site/components/SiteHeader";

import LegacyMotion from "~/legacy/components/LegacyMotion";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

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

function formatDate(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

interface CoverImageProps {
  post: BlogPostSummary;
  className?: string;
}

function CoverImage({ post, className }: CoverImageProps) {
  if (post.cover_image_url) {
    return (
      <img
        src={post.cover_image_url}
        alt=''
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-primary/10",
        className,
      )}
    >
      <span
        className='text-6xl text-primary/20'
        style={{
          fontFamily: "'Fraunces', serif",
        }}
      >
        {post.title.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

const BlogIndex = () => {
  const { posts } = useLoaderData<typeof loader>();

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();

    for (const post of posts) {
      for (const tag of post.tags) {
        tags.add(tag);
      }
    }

    return Array.from(tags).slice(0, 8);
  }, [posts]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesQuery =
        !normalizedQuery ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.excerpt.toLowerCase().includes(normalizedQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      const matchesTag = !activeTag || post.tags.includes(activeTag);

      return matchesQuery && matchesTag;
    });
  }, [posts, query, activeTag]);

  const [featured, ...rest] = filtered;

  const hasFilters = query.trim().length > 0 || activeTag !== null;

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <SiteHeader />

      <main className='mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20'>
        {/* Hero */}
        <section>
          <p className='font-mono text-[11px] uppercase tracking-[0.2em] text-primary'>
            Blog
          </p>

          <h1
            className='mt-3 text-4xl leading-tight tracking-tight text-foreground sm:mt-4 sm:text-5xl'
            style={{
              fontFamily: "'Fraunces', serif",
            }}
          >
            Field notes from building this.
          </h1>

          <p className='mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg'>
            Architecture decisions, features shipped, product experiments,
            lessons learned, and what changed along the way.
          </p>
        </section>

        {/* Search + filters */}
        {posts.length > 0 && (
          <section className='mt-8'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
              <div className='relative sm:w-72'>
                <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />

                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder='Search posts...'
                  aria-label='Search blog posts'
                  className='h-10 rounded-sm border bg-card pl-9 text-sm shadow-none focus-visible:ring-ring/20'
                />
              </div>

              {allTags.length > 0 && (
                <div
                  className='flex flex-wrap gap-2'
                  aria-label='Filter by tag'
                >
                  <button
                    type='button'
                    onClick={() => setActiveTag(null)}
                    aria-pressed={activeTag === null}
                    className={cn(
                      "rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors",
                      activeTag === null
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    All
                  </button>

                  {allTags.map((tag) => {
                    const active = activeTag === tag;

                    return (
                      <button
                        key={tag}
                        type='button'
                        onClick={() => setActiveTag(active ? null : tag)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {hasFilters && (
              <div className='mt-4 flex items-center gap-2 text-xs text-muted-foreground'>
                <span>
                  {filtered.length} {filtered.length === 1 ? "post" : "posts"}
                </span>

                <span aria-hidden='true'>·</span>

                <button
                  type='button'
                  onClick={() => {
                    setQuery("");
                    setActiveTag(null);
                  }}
                  className='font-medium text-primary hover:underline'
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        )}

        {/* Content */}
        {posts.length === 0 ? (
          <div className='mt-16 rounded-lg border bg-card p-8'>
            <p className='text-sm text-muted-foreground'>
              Nothing published yet — the first post is on the way.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className='mt-16 rounded-lg border bg-card p-8'>
            <p className='text-sm text-muted-foreground'>
              No posts match{" "}
              <span className='font-medium text-foreground'>"{query}"</span>.
            </p>
          </div>
        ) : (
          <div className='mt-12'>
            {/* Featured post */}
            {featured && (
              <LegacyMotion
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.3,
                }}
              >
                <Link
                  to={`/blog/${featured.slug}`}
                  className='group grid overflow-hidden rounded-sm border bg-card transition-colors hover:bg-accent/30 sm:grid-cols-2'
                >
                  <div className='aspect-[16/10] overflow-hidden bg-muted sm:aspect-auto'>
                    <CoverImage
                      post={featured}
                      className='transition-transform duration-300 group-hover:scale-[1.02]'
                    />
                  </div>

                  <div className='flex flex-col justify-center p-6 sm:p-8'>
                    <div className='flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground'>
                      {featured.published_at && (
                        <time dateTime={featured.published_at}>
                          {formatDate(featured.published_at)}
                        </time>
                      )}

                      {featured.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant='outline'
                          className='rounded-md font-mono text-[10px] uppercase tracking-wider'
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <h2
                      className='mt-3 text-2xl leading-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl'
                      style={{
                        fontFamily: "'Fraunces', serif",
                      }}
                    >
                      {featured.title}
                    </h2>

                    {featured.excerpt && (
                      <p className='mt-3 leading-7 text-muted-foreground'>
                        {featured.excerpt}
                      </p>
                    )}

                    <span className='mt-5 font-mono text-xs uppercase tracking-[0.14em] text-primary group-hover:underline'>
                      Read post →
                    </span>
                  </div>
                </Link>
              </LegacyMotion>
            )}

            {/* Remaining posts */}
            {rest.length > 0 && (
              <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {rest.map((post, index) => (
                  <LegacyMotion
                    key={post.id}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.04, 0.2),
                    }}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className='group flex h-full flex-col overflow-hidden rounded-sm border bg-card transition-colors hover:bg-accent/30'
                    >
                      <div className='aspect-[16/10] overflow-hidden bg-muted'>
                        <CoverImage
                          post={post}
                          className='transition-transform duration-300 group-hover:scale-[1.03]'
                        />
                      </div>

                      <div className='flex flex-1 flex-col p-5'>
                        <div className='font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground'>
                          {post.published_at && (
                            <time dateTime={post.published_at}>
                              {formatDate(post.published_at)}
                            </time>
                          )}
                        </div>

                        <h3
                          className='mt-2 text-lg leading-snug text-foreground transition-colors group-hover:text-primary'
                          style={{
                            fontFamily: "'Fraunces', serif",
                          }}
                        >
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className='mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground'>
                            {post.excerpt}
                          </p>
                        )}

                        {post.tags.length > 0 && (
                          <div className='mt-4 flex flex-wrap gap-2'>
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant='outline'
                                className='rounded-md font-mono text-[10px] uppercase tracking-wider'
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </LegacyMotion>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default BlogIndex;
