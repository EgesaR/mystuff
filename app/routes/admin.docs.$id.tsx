import { useCallback, useEffect, useState } from "react";
import { Link, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/admin.docs.$id";

import { ArrowLeft, ExternalLink, FileText } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { isLegacyIOSUserAgent } from "~/legacy/mdx/legacy";
import { LegacyDocEditor } from "~/legacy/components/LegacyDocEditor";

interface DocPage {
  id: string;
  slug: string;
  category: string;
  title: string;
  content: string;
  order: number;
}

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "Edit docs page",
    description: "Developer docs editor.",
    path: "/admin/docs",
  });

export async function loader({ params, request }: Route.LoaderArgs) {
  const page = await apiFetchServer<DocPage>(
    `/docs/admin/${params.id}`,
    {},
    request,
  );

  const userAgent = request.headers.get("user-agent") ?? "";

  const legacyIOS = isLegacyIOSUserAgent(userAgent);

  return {
    page,
    legacyIOS,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();

  const payload = {
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? ""),
    content: String(formData.get("content") ?? ""),
    order: Number(formData.get("order") ?? 0),
  };

  await apiFetchServer(
    `/docs/${params.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    request,
  );

  return redirect(`/admin/docs/${params.id}`);
}

type Draft = Pick<DocPage, "title" | "category" | "content" | "order">;

const AdminDocEditor = () => {
  const { page, legacyIOS } = useLoaderData<typeof loader>();

  const [draft, setDraft] = useState<Draft>({
    title: page.title,
    category: page.category,
    content: page.content,
    order: page.order,
  });

  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const save = useCallback(
    async (data: Draft) => {
      await apiFetchClient(`/api/docs/${page.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    [page.id],
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

  if (legacyIOS) {
    return (
      <main className='min-h-full bg-background text-foreground'>
        <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10'>
          <header className='mb-8'>
            <Link to='/admin/docs' className='text-sm text-muted-foreground'>
              ← All docs
            </Link>

            <h1 className='mt-4 text-2xl font-semibold'>Edit documentation</h1>

            <p className='mt-1 text-sm text-muted-foreground'>
              Legacy browser mode
            </p>
          </header>

          <LegacyDocEditor page={page} />
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-full bg-background text-foreground'>
      <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10'>
        {/* Header */}
        <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <Link
            to='/admin/docs'
            className='inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            <ArrowLeft className='size-4' />
            All docs
          </Link>

          <div className='flex items-center justify-between gap-3 sm:justify-end'>
            <SaveStatusBadge status={status} onSaveNow={saveNow} />

            <Button asChild variant='outline' size='sm' className='gap-1.5'>
              <a
                href={`/docs/${page.slug}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <span className='hidden sm:inline'>View live</span>

                <ExternalLink className='size-3.5' />
              </a>
            </Button>
          </div>
        </header>

        {/* Document metadata */}
        <section className='mt-8'>
          <div className='mb-4 flex items-center gap-2'>
            <FileText className='size-4 text-muted-foreground' />

            <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Documentation
            </span>
          </div>

          <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px_90px]'>
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
                placeholder='Page title'
              />
            </div>

            <div>
              <Label htmlFor='category'>Category</Label>

              <Input
                id='category'
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className='mt-1.5'
                placeholder='Getting Started'
              />
            </div>

            <div>
              <Label htmlFor='order'>Order</Label>

              <Input
                id='order'
                type='number'
                min={0}
                value={draft.order}
                onChange={(event) => {
                  const value = Number(event.target.value);

                  setDraft((current) => ({
                    ...current,
                    order: Number.isFinite(value) ? value : 0,
                  }));
                }}
                className='mt-1.5'
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
              <div className='mb-8 border-b pb-6'>
                <p className='mb-2 text-sm font-medium text-primary'>
                  {draft.category}
                </p>

                <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                  {draft.title || "Untitled page"}
                </h1>

                <p className='mt-2 font-mono text-xs text-muted-foreground'>
                  /{page.slug}
                </p>
              </div>

              {draft.content.trim() ? (
                <MdxRenderer content={draft.content} />
              ) : (
                <p className='text-sm italic text-muted-foreground'>
                  Nothing to preview yet.
                </p>
              )}
            </article>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default AdminDocEditor;
