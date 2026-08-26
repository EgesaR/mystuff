import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/docs.$slug";

import { ArrowLeft } from "lucide-react";

import MdxRenderer from "~/features/mdx/components/MdxRenderer";
import LegacyMdxRenderer from "~/legacy/mdx/LegacyMdxRenderer";
import { isLegacyIOSUserAgent } from "~/legacy/mdx/legacy";

import { apiFetch } from "~/lib/api/server";
import { buildMeta, jsonLd, SITE_URL } from "~/lib/seo";

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

export async function loader({ params, request }: Route.LoaderArgs) {
  if (!params.slug) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  const page = await apiFetch<DocPage>(`/docs/${params.slug}`);

  const userAgent = request.headers.get("user-agent") ?? "";

  const legacyIOS = isLegacyIOSUserAgent(userAgent);

  return { page, legacyIOS };
}

function stripMarkdown(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`~[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const page = loaderData?.page;

  if (!page) {
    return buildMeta({
      title: "Documentation",
      description:
        "Documentation for My Stuff — learn how to use notes, files, collections, sharing, and the My Stuff API.",
      path: "/docs",
    });
  }

  const description =
    stripMarkdown(page.content).slice(0, 155).trim() ||
    `${page.title} documentation for My Stuff.`;

  return buildMeta({
    title: page.title,
    description,
    path: `/docs/${page.slug}`,
    type: "article",
  });
};

const DocsPage = () => {
  const { page, legacyIOS } = useLoaderData<typeof loader>();

  const canonicalUrl = `${SITE_URL}/docs/${page.slug}`;

  const description =
    stripMarkdown(page.content).slice(0, 155).trim() ||
    `${page.title} documentation for My Stuff.`;

  return (
    <>
      <script
        type='application/ld+json'
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: page.title,
          description,
          dateCreated: page.created_at,
          dateModified: page.updated_at,
          mainEntityOfPage: canonicalUrl,
        })}
      />

      <article className='max-w-3xl'>
        <Link
          to='/docs'
          className='mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='size-4' />
          Documentation
        </Link>

        <header className='mb-10'>
          <p className='mb-2 text-sm font-medium text-primary'>
            {page.category}
          </p>

          <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            {page.title}
          </h1>
        </header>
        {legacyIOS ? (
          <LegacyMdxRenderer content={page.content} />
        ) : (
          <MdxRenderer content={page.content} />
        )}
      </article>
    </>
  );
};

export default DocsPage;

/**
 * Welcome to **My Stuff** — a personal workspace for keeping your notes, files, ideas, and projects in one place.

My Stuff is designed around a simple idea: the information you use every day should be easy to capture, organize, find, and share without constantly moving between different applications.

<Callout type="info" title="My Stuff is actively evolving">
Some features are already available while others are still being developed. The documentation will continue to grow alongside the platform.
</Callout>

## What is My Stuff?

My Stuff brings together several parts of your digital workspace that are usually scattered across different applications.

You can use it to:

- Write and organize notes.
- Store and manage files.
- Group related information into collections.
- Share content with other people.
- Collaborate on documents in real time.
- Use voice dictation to capture ideas.
- Browse developer documentation and technical resources.

The goal is not to give you another complicated system to maintain. Instead, My Stuff is designed to give your information a place where it can stay connected.

## Your workspace

When you open My Stuff, your workspace becomes the central place for everything you are working on.

A typical workflow might look something like this:

<Steps>

<Step title="Capture">

Start with whatever you have.

Write a note, upload a file, paste an idea, or dictate something using voice input.

You do not need to decide where everything belongs immediately.

</Step>

<Step title="Organize">

As your workspace grows, organize information using folders, collections, tags, and other navigation tools.

The same project can bring together notes, files, and other resources without forcing everything into a single format.

</Step>

<Step title="Work together">

Share individual resources or collaborate with other people when you need to.

My Stuff is being developed with real-time presence, comments, sharing, and notifications so collaboration can happen directly where the work lives.

</Step>

<Step title="Find it again">

Use navigation and search to return to the information you have already collected.

The long-term goal is simple: your workspace should become more useful as it grows instead of becoming harder to navigate.

</Step>

</Steps>

## Notes

Notes are one of the core parts of My Stuff.

The editor is being developed to support rich text, structured documents, tables, media, comments, mentions, and other tools for writing and organizing information.

You can use notes for anything from quick thoughts to longer documents and project information.

## Files

Keep your files close to the notes and projects they belong to.

My Stuff's file system is being developed around uploads, folders, collections, previews, and easier navigation so files do not become disconnected from the work around them.

## Collections

Folders are useful when something has one obvious location.

Collections are useful when information belongs to several contexts.

For example, a document could belong to both a project and a research collection without needing to be duplicated.

## Collaboration

My Stuff is being built with collaboration in mind.

Features currently available or under development include:

- Real-time presence.
- Shared resources.
- Comments and mentions.
- Notifications.
- Shareable links.
- Expiring access.
- Document history and recovery.

Some of these capabilities are still evolving as the platform matures.

## Voice and dictation

Sometimes typing is not the fastest way to capture an idea.

My Stuff includes voice dictation capabilities designed for quickly turning speech into usable text.

Future improvements are focused on areas such as:

- Better transcription accuracy.
- Different accents and speaking styles.
- Background-noise handling.
- Multilingual speech.
- Lower latency.
- Better handling of natural speech.

<Callout type="tip" title="Capture first, organize later">
A useful workspace should let you capture an idea quickly without forcing you to stop and organize it before you continue.
</Callout>

## Developer documentation

My Stuff also includes a developer-focused documentation system.

The documentation platform uses **Markdown and MDX**, allowing technical content to combine normal documentation with reusable components such as callouts, steps, cards, tabs, and code examples.

As the platform develops, the developer documentation will cover areas such as:

- APIs and authentication.
- Notes and document features.
- Files and storage.
- Sharing.
- Collaboration.
- Webhooks and integrations.
- Platform architecture.
- SDKs and developer tooling.

## What is coming next?

My Stuff is still under active development, and there is a lot more planned.

### Offline work

Continue working when the network is unavailable and synchronize changes when connectivity returns.

### Better synchronization

Improve real-time synchronization, reconnect behavior, and conflict handling across devices.

### Desktop applications

Native desktop experiences are being explored alongside the web application, including deeper integration with desktop environments.

### Search

Search is being expanded to make it easier to find notes, files, documents, and other resources across the workspace.

### Document history

Version history, recovery, snapshots, and other tools are being developed to make important information safer to work with.

### More collaboration tools

Future collaboration work includes richer presence, comments, permissions, sharing controls, and team-oriented workflows.

## Where should you go next?

Start with the part of My Stuff you are most interested in.

<Card
  title="Notes"
  description="Learn about writing, organizing, and managing notes."
>
  Explore how the document editor works and how notes fit into your workspace.
</Card>

<Card
  title="Files"
  description="Learn how files, folders, and collections work."
>
  Understand how My Stuff stores and organizes your files.
</Card>

<Card
  title="Collaboration"
  description="Work with other people in real time."
>
  Learn about sharing, presence, comments, and notifications.
</Card>

<Card
  title="Developer"
  description="Build with the My Stuff platform."
>
  Explore the API, authentication, integrations, and developer tooling.
</Card>

## One workspace, one place to start

My Stuff is ultimately about reducing the distance between **having information** and **being able to use it**.

Capture something.

Organize it when it matters.

Find it when you need it.

Share it when you want to.

And keep everything connected along the way.

Welcome to **My Stuff**.
 */
