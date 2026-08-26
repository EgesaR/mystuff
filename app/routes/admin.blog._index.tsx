import { Form, Link, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/admin.blog._index";

import { Plus, Newspaper } from "lucide-react";

import { apiFetch } from "~/lib/api/server";
import { buildMeta } from "~/lib/seo";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
}

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Manage Blog",
    description: "Developer blog admin.",
    path: "/admin/blog",
  });

export async function loader({ request }: Route.LoaderArgs) {
  const posts = await apiFetch<BlogPostSummary[]>("/blog/admin", {}, request);

  return { posts };
}

export async function action({ request }: Route.ActionArgs) {
  const created = await apiFetch<{ id: string }>(
    "/blog",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Untitled post",
        excerpt: "Write a short summary…",
        content: "Start writing…",
        tags: [],
        is_published: false,
      }),
    },
    request,
  );

  return redirect(`/admin/blog/${created.id}`);
}

const AdminBlogIndex = () => {
  const { posts } = useLoaderData<typeof loader>();

  const publishedCount = posts.filter((post) => post.is_published).length;

  const draftCount = posts.length - publishedCount;

  return (
    <main className='min-h-full bg-background text-foreground'>
      <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12'>
        {/* Header */}
        <header className='flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Newspaper className='size-4 text-muted-foreground' />

              <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                Developer
              </p>
            </div>

            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>Blog</h1>

              <p className='mt-1 text-sm text-muted-foreground'>
                Manage your developer blog posts.
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
              New post
            </Button>
          </Form>
        </header>

        {/* Stats */}
        <div className='mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground'>
          <span className='font-medium text-foreground'>{posts.length}</span>

          <span>{posts.length === 1 ? "post" : "posts"}</span>

          {posts.length > 0 && (
            <>
              <span aria-hidden='true'>·</span>

              <span>{publishedCount} published</span>

              <span aria-hidden='true'>·</span>

              <span>{draftCount} drafts</span>
            </>
          )}
        </div>

        {/* Posts */}
        <div className='mt-8'>
          <Card className='overflow-hidden'>
            <CardHeader className='border-b bg-muted/30 px-4 py-3 sm:px-5'>
              <CardTitle className='text-sm font-semibold'>Posts</CardTitle>
            </CardHeader>

            <CardContent className='p-0'>
              {posts.length === 0 ? (
                <div className='flex flex-col items-center justify-center px-6 py-12 text-center'>
                  <div className='mb-4 flex size-10 items-center justify-center rounded-lg bg-muted'>
                    <Newspaper className='size-5 text-muted-foreground' />
                  </div>

                  <h2 className='text-sm font-semibold'>No posts yet</h2>

                  <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
                    Create your first blog post to get started.
                  </p>

                  <Form method='post' className='mt-5'>
                    <Button type='submit' size='sm' className='gap-1.5'>
                      <Plus className='size-4' />
                      Create post
                    </Button>
                  </Form>
                </div>
              ) : (
                <ul className='divide-y'>
                  {posts.map((post) => (
                    <li key={post.id}>
                      <Link
                        to={`/admin/blog/${post.id}`}
                        className='group flex min-w-0 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent hover:text-accent-foreground sm:px-5'
                      >
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-medium'>
                            {post.title || "Untitled post"}
                          </p>

                          <p className='mt-0.5 truncate font-mono text-xs text-muted-foreground'>
                            /{post.slug}
                          </p>
                        </div>

                        <Badge
                          variant={post.is_published ? "default" : "secondary"}
                          className='shrink-0'
                        >
                          {post.is_published ? "Published" : "Draft"}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default AdminBlogIndex;
