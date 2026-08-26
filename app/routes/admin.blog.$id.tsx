import { useCallback, useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/admin.blog.$id";

import { ArrowLeft, ExternalLink, Newspaper } from "lucide-react";

import { apiFetch as apiFetchServer } from "~/lib/api/server";
import { apiFetch as apiFetchClient } from "~/lib/api/client";
import { buildMeta } from "~/lib/seo";

import { useAutosave } from "~/hooks/useAutosave";

import { SaveStatusBadge } from "~/features/admin/components/SaveStatusBadge";
import MdxRenderer from "~/features/mdx/components/MdxRenderer";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  is_published: boolean;
}

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Edit blog post",
    description: "Developer blog editor.",
    path: "/admin/blog",
  });

export async function loader({ params, request }: Route.LoaderArgs) {
  const post = await apiFetchServer<BlogPost>(
    `/blog/admin/${params.id}`,
    {},
    request,
  );

  return { post };
}

type Draft = Pick<
  BlogPost,
  "title" | "excerpt" | "content" | "cover_image_url" | "tags" | "is_published"
>;

const AdminBlogEditor = () => {
  const { post } = useLoaderData<typeof loader>();

  const [draft, setDraft] = useState<Draft>({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    cover_image_url: post.cover_image_url,
    tags: post.tags,
    is_published: post.is_published,
  });

  const [tagsInput, setTagsInput] = useState(post.tags.join(", "));

  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const save = useCallback(
    async (data: Draft) => {
      await apiFetchClient(`/api/blog/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    [post.id],
  );

  const { status, saveNow } = useAutosave({
    data: draft,
    onSave: save,
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveNow();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [saveNow]);

  const updateTags = (value: string) => {
    setTagsInput(value);

    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);

    setDraft((current) => ({
      ...current,
      tags,
    }));
  };

  return (
    <main className='min-h-full bg-background text-foreground'>
      <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10'>
        {/* Header */}
        <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <Link
            to='/admin/blog'
            className='inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            <ArrowLeft className='size-4' />
            All posts
          </Link>

          <div className='flex items-center justify-between gap-3 sm:justify-end'>
            <SaveStatusBadge status={status} onSaveNow={saveNow} />

            {draft.is_published && (
              <Button asChild variant='outline' size='sm' className='gap-1.5'>
                <a
                  href={`/blog/${post.slug}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <span className='hidden sm:inline'>View live</span>

                  <ExternalLink className='size-3.5' />
                </a>
              </Button>
            )}
          </div>
        </header>

        {/* Metadata */}
        <section className='mt-8'>
          <div className='mb-4 flex items-center gap-2'>
            <Newspaper className='size-4 text-muted-foreground' />

            <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Blog post
            </span>
          </div>

          <div className='space-y-4'>
            {/* Title */}
            <div>
              <Label htmlFor='title'>Title</Label>

              <Input
                id='title'
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className='mt-1.5'
                placeholder='Post title'
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor='excerpt'>Excerpt</Label>

              <Textarea
                id='excerpt'
                value={draft.excerpt}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    excerpt: event.target.value,
                  }))
                }
                className='mt-1.5 min-h-20 resize-y'
                placeholder='Write a short summary...'
              />
            </div>

            {/* Image + Tags */}
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <Label htmlFor='cover'>Cover image URL</Label>

                <Input
                  id='cover'
                  value={draft.cover_image_url ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      cover_image_url: event.target.value.trim() || null,
                    }))
                  }
                  className='mt-1.5'
                  placeholder='https://...'
                  type='url'
                />
              </div>

              <div>
                <Label htmlFor='tags'>Tags</Label>

                <Input
                  id='tags'
                  value={tagsInput}
                  onChange={(event) => updateTags(event.target.value)}
                  className='mt-1.5'
                  placeholder='react, typescript, fastapi'
                />

                <p className='mt-1.5 text-xs text-muted-foreground'>
                  Separate tags with commas. Maximum 8.
                </p>
              </div>
            </div>

            {/* Publication */}
            <div className='flex items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4'>
              <div className='min-w-0'>
                <Label
                  htmlFor='published'
                  className='cursor-pointer text-sm font-medium'
                >
                  {draft.is_published ? "Published" : "Draft"}
                </Label>

                <p className='mt-1 text-xs text-muted-foreground'>
                  {draft.is_published
                    ? "This post is visible on your public blog."
                    : "This post is saved but hidden from the public blog."}
                </p>
              </div>

              <Switch
                id='published'
                checked={draft.is_published}
                onCheckedChange={(checked) =>
                  setDraft((current) => ({
                    ...current,
                    is_published: checked,
                  }))
                }
              />
            </div>
          </div>
        </section>

        {/* Editor */}
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as "edit" | "preview")}
          className='mt-8'
        >
          <div className='flex items-center justify-between gap-4 border-b'>
            <TabsList className='rounded-none border-0 bg-transparent'>
              <TabsTrigger value='edit'>Edit</TabsTrigger>

              <TabsTrigger value='preview'>Preview</TabsTrigger>
            </TabsList>

            <span className='hidden text-xs text-muted-foreground sm:block'>
              {draft.content.length.toLocaleString()} characters
            </span>
          </div>

          <TabsContent value='edit' className='mt-0'>
            <div className='mt-4 overflow-hidden rounded-lg border bg-card'>
              <Textarea
                value={draft.content}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
                className='min-h-[60vh] resize-y rounded-none border-0 bg-transparent px-4 py-4 font-mono text-sm leading-6 shadow-none focus-visible:ring-0'
                placeholder='Write your MDX content...'
                spellCheck={false}
              />
            </div>
          </TabsContent>

          <TabsContent value='preview' className='mt-0'>
            <article className='mt-4 rounded-lg border bg-card p-5 sm:p-8'>
              {/* Blog preview header */}
              <header className='border-b pb-8'>
                <div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                  <span>Blog</span>

                  {draft.is_published && (
                    <>
                      <span aria-hidden='true'>·</span>

                      <span className='text-primary'>Published</span>
                    </>
                  )}
                </div>

                <h1 className='mt-3 text-3xl font-bold tracking-tight sm:text-4xl'>
                  {draft.title || "Untitled post"}
                </h1>

                {draft.excerpt && (
                  <p className='mt-3 max-w-2xl text-base leading-7 text-muted-foreground'>
                    {draft.excerpt}
                  </p>
                )}

                {draft.tags.length > 0 && (
                  <div className='mt-5 flex flex-wrap gap-2'>
                    {draft.tags.map((tag) => (
                      <span
                        key={tag}
                        className='rounded-md border bg-muted px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* Cover */}
              {draft.cover_image_url && (
                <div className='mt-8 overflow-hidden rounded-lg border'>
                  <img
                    src={draft.cover_image_url}
                    alt=''
                    className='max-h-[420px] w-full object-cover'
                    loading='lazy'
                  />
                </div>
              )}

              {/* Content */}
              <div className='mt-8'>
                {draft.content.trim() ? (
                  <MdxRenderer content={draft.content} />
                ) : (
                  <p className='text-sm italic text-muted-foreground'>
                    Nothing to preview yet.
                  </p>
                )}
              </div>
            </article>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default AdminBlogEditor;
