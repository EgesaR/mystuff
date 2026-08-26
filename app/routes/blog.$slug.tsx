import { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/blog.$slug";

import { ArrowLeft, CalendarDays, User } from "lucide-react";

import SiteHeader from "~/features/site/components/SiteHeader";
import SiteFooter from "~/features/site/components/SiteFooter";

import MdxRenderer from "~/features/mdx/components/MdxRenderer";
import LegacyMdxRenderer from "~/legacy/mdx/LegacyMdxRenderer";
import { isLegacyIOSUserAgent } from "~/legacy/mdx/legacy";

import { buildMeta, jsonLd, SITE_URL } from "~/lib/seo";
import { apiFetch } from "~/lib/api/server";

import { Badge } from "~/components/ui/badge";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  published_at: string | null;
  author: {
    id: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  if (!params.slug) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  const post = await apiFetch<BlogPost>(`/blog/${params.slug}`);

  const userAgent = request.headers.get("user-agent") ?? "";

  const legacyIOS = isLegacyIOSUserAgent(userAgent);

  return { post, legacyIOS };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const post = loaderData?.post;

  return buildMeta({
    title: post?.title ?? "Blog",
    description: post?.excerpt ?? "A post from the My Stuff blog.",
    path: post?.slug ? `/blog/${post.slug}` : "/blog",
    image: post?.cover_image_url ?? undefined,
    type: "article",
    keywords: post?.tags,
  });
};

function formatDate(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

const BlogPost = () => {
  const { post, legacyIOS } = useLoaderData<typeof loader>();

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <script
        type='application/ld+json'
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.cover_image_url ?? undefined,
          datePublished: post.published_at ?? undefined,
          dateModified: post.updated_at,
          author: {
            "@type": "Person",
            name: post.author.username,
          },
          mainEntityOfPage: canonicalUrl,
        })}
      />

      <SiteHeader />

      <main className='mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16'>
        <Link
          to='/blog'
          className='inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='size-4' />
          All posts
        </Link>

        <header className='mt-8 max-w-3xl'>
          <div className='flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground'>
            {post.published_at && (
              <span className='inline-flex items-center gap-1.5'>
                <CalendarDays className='size-3.5' />

                <time dateTime={post.published_at}>
                  {formatDate(post.published_at)}
                </time>
              </span>
            )}

            {post.published_at && <span aria-hidden='true'>·</span>}

            <span className='inline-flex items-center gap-1.5'>
              <User className='size-3.5' />
              {post.author.username}
            </span>
          </div>

          <h1
            className='mt-5 text-4xl leading-[1.05] tracking-tight text-foreground sm:text-6xl'
            style={{
              fontFamily: "'Fraunces', serif",
            }}
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <p className='mt-6 max-w-2xl text-lg leading-8 text-muted-foreground'>
              {post.excerpt}
            </p>
          )}

          {post.tags.length > 0 && (
            <div className='mt-6 flex flex-wrap gap-2'>
              {post.tags.map((tag) => (
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
        </header>

        {post.cover_image_url && (
          <figure className='mt-10 overflow-hidden rounded-xl border bg-muted'>
            <img
              src={post.cover_image_url}
              alt=''
              className='block h-auto max-h-[520px] w-full object-contain'
            />
          </figure>
        )}

        <article className='mt-12 max-w-3xl'>
          {legacyIOS ? (
            <LegacyMdxRenderer content={post.content} />
          ) : (
            <MdxRenderer content={post.content} />
          )}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
};

export default BlogPost;
