import {
  FolderClosed,
  Layers,
  MessageSquare,
  NotebookPen,
  Share2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router";

import type { Route } from "./+types/_index";

import type { AccentColor } from "~/types";

import { Button } from "~/components/ui/button";
import SiteFooter from "~/features/site/components/SiteFooter";
import SiteHeader from "~/features/site/components/SiteHeader";

import { buildMeta, jsonLd, SITE_URL } from "~/lib/seo";
import { cn } from "~/lib/utils";

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "My Stuff — Organize Notes, Files & Ideas",
    description:
      "My Stuff is a personal workspace for organizing notes, files, and collections, with real-time editing, sharing, comments, and collaboration.",
    path: "/",
    keywords: [
      "personal notes app",
      "file management app",
      "note taking software",
      "real-time collaboration notes",
      "digital file organizer",
    ],
  });

type Feature = {
  code: string;
  icon: LucideIcon;
  title: string;
  body: string;
  accent: AccentColor;
};

const FEATURES: Feature[] = [
  {
    code: "F-01",
    icon: NotebookPen,
    title: "Notes that hold their shape",
    body: "A rich text editor with inline comments, @mentions, and a find-and-replace that actually works — export to Markdown or Word whenever you need to leave.",
    accent: "primary",
  },
  {
    code: "F-02",
    icon: FolderClosed,
    title: "Files, filed properly",
    body: "Drag, drop, lasso-select, and merge folders without losing track. Every file gets a preview, a home, and a way back to you.",
    accent: "warning",
  },
  {
    code: "F-03",
    icon: Layers,
    title: "Collections, not just folders",
    body: "Group notes and files by project, not just by location — the same file can live in three collections without being copied three times.",
    accent: "foreground",
  },
  {
    code: "F-04",
    icon: Users,
    title: "Presence, without the awkwardness",
    body: "See who else is looking at a note right now, with a cursor and a name — no more “wait, are you editing this too?” messages.",
    accent: "primary",
  },
  {
    code: "F-05",
    icon: Share2,
    title: "Sharing with an expiry date",
    body: "Send a scoped, revocable link instead of a copy. Share a folder, a note, or a single file — and pull it back whenever you want.",
    accent: "warning",
  },
  {
    code: "F-06",
    icon: MessageSquare,
    title: "Comments that reach people",
    body: "@mention a collaborator inline and they get notified — on the page, not buried in an inbox they'll open next week.",
    accent: "foreground",
  },
];

const STACK_CARDS = [
  {
    code: "F-01",
    title: "Notes",
    body: "Rich text, live cursors, comments that @mention.",
    accent: "primary" as const,
  },
  {
    code: "F-02",
    title: "Files",
    body: "Drag, drop, tag, and preview anything you keep.",
    accent: "warning" as const,
  },
  {
    code: "F-03",
    title: "Collections",
    body: "Group loose ends into something you can find again.",
    accent: "foreground" as const,
  },
  {
    code: "F-04",
    title: "Presence",
    body: "See who's editing, in real time, without asking.",
    accent: "primary" as const,
  },
];

const WORKFLOW = [
  {
    label: "Capture",
    body: "Drop a file, paste a link, or start typing — nothing needs a folder yet.",
  },
  {
    label: "Organize",
    body: "Tag it, collect it, or leave it where it landed. My Stuff doesn't force a system on you.",
  },
  {
    label: "Share",
    body: "Send a link, invite a collaborator, or keep it to yourself. Access is always yours to revoke.",
  },
];

function accentClasses(accent: AccentColor) {
  switch (accent) {
    case "primary":
      return {
        border: "border-l-primary",
        text: "text-primary",
        bg: "bg-primary/10",
      };

    case "warning":
      return {
        border: "border-l-amber-600 dark:border-l-amber-400",
        text: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-500/10",
      };

    case "foreground":
      return {
        border: "border-l-foreground",
        text: "text-foreground",
        bg: "bg-muted",
      };
  }
}

const IndexCardStack = () => {
  return (
    <div className='relative mx-auto h-[22.5rem] w-full max-w-sm sm:h-[25rem]'>
      {STACK_CARDS.map((card, index) => {
        const accent = accentClasses(card.accent);

        return (
          <motion.div
            key={card.code}
            className={cn(
              "absolute inset-x-4 top-0 rounded-sm border bg-card p-5 shadow-sm",
              accent.border,
              "border-l-4",
            )}
            initial={{
              opacity: 0,
              y: 40,
              rotate: 0,
            }}
            animate={{
              opacity: 1,
              y: index * 24,
              rotate: (index - 1.5) * 2.5,
            }}
            transition={{
              delay: 0.15 + index * 0.12,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              rotate: 0,
              y: index * 24 - 10,
              zIndex: 20,
            }}
          >
            <div className='flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground'>
              <span>{card.code}</span>
              <span>My Stuff</span>
            </div>

            <h3
              className='mt-3 text-2xl text-foreground'
              style={{
                fontFamily: "'Fraunces', serif",
              }}
            >
              {card.title}
            </h3>

            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              {card.body}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

const Index = () => {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <script
        type='application/ld+json'
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "My Stuff",
          applicationCategory: "ProductivityApplication",
          operatingSystem: "web",
          url: SITE_URL,
          description:
            "A personal workspace for notes, files, and collections with real-time collaboration and sharing.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        })}
      />

      <SiteHeader />

      <main>
        {/* Hero */}
        <section className='mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24'>
          <div>
            <p className='font-mono text-xs uppercase tracking-[0.2em] text-primary'>
              Personal workspace, cataloged
            </p>

            <h1
              className='mt-4 text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl'
              style={{
                fontFamily: "'Fraunces', serif",
              }}
            >
              Organize your notes, files, and ideas in one place.
            </h1>

            <p className='mt-6 max-w-md text-lg leading-relaxed text-muted-foreground'>
              My Stuff is where notes, files and half-finished ideas stop
              scattering across ten different apps — and start living somewhere
              you can actually find them again.
            </p>

            <div className='mt-8 flex flex-wrap items-center gap-4'>
              <Button
                asChild
                size='lg'
                className='rounded-sm font-mono text-xs uppercase tracking-[0.14em]'
              >
                <Link to='/auth/signup'>Start filling — it's free</Link>
              </Button>

              <Button
                asChild
                variant='outline'
                size='lg'
                className='rounded-sm font-mono text-xs uppercase tracking-[0.14em]'
              >
                <Link to='/docs'>Read the docs</Link>
              </Button>
            </div>
          </div>

          <IndexCardStack />
        </section>

        {/* Feature catalog */}
        <section className='border-y bg-muted/40'>
          <div className='mx-auto max-w-6xl px-6 py-20'>
            <div className='max-w-xl'>
              <p className='font-mono text-xs uppercase tracking-[0.2em] text-primary'>
                The catalog
              </p>

              <h2
                className='mt-3 text-3xl text-foreground sm:text-4xl'
                style={{
                  fontFamily: "'Fraunces', serif",
                }}
              >
                Six drawers. One desk.
              </h2>
            </div>

            <div className='mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              {FEATURES.map((feature) => {
                const accent = accentClasses(feature.accent);

                return (
                  <div
                    key={feature.code}
                    className={cn(
                      "rounded-sm border border-l-4 bg-card p-6 shadow-sm",
                      accent.border,
                    )}
                  >
                    <div className='flex items-center justify-between'>
                      <feature.icon
                        className={cn("size-5", accent.text)}
                        strokeWidth={1.5}
                      />

                      <span className='font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground'>
                        {feature.code}
                      </span>
                    </div>

                    <h3 className='mt-4 text-lg font-semibold text-foreground'>
                      {feature.title}
                    </h3>

                    <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                      {feature.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className='mx-auto max-w-6xl px-6 py-20'>
          <p className='font-mono text-xs uppercase tracking-[0.2em] text-primary'>
            How it works
          </p>

          <h2
            className='mt-3 max-w-xl text-3xl text-foreground sm:text-4xl'
            style={{
              fontFamily: "'Fraunces', serif",
            }}
          >
            No system to learn before you start.
          </h2>

          <div className='mt-12 grid overflow-hidden rounded-sm border bg-card sm:grid-cols-3'>
            {WORKFLOW.map((step, index) => (
              <div
                key={step.label}
                className={cn(
                  "p-8",
                  index > 0 && "border-t sm:border-l sm:border-t-0",
                )}
              >
                <span className='font-mono text-xs uppercase tracking-[0.18em] text-primary'>
                  {step.label}
                </span>

                <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className='border-t bg-foreground text-background'>
          <div className='mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between'>
            <h2
              className='max-w-md text-3xl sm:text-4xl'
              style={{
                fontFamily: "'Fraunces', serif",
              }}
            >
              Open a drawer. See what fits.
            </h2>

            <Button
              asChild
              size='lg'
              variant='secondary'
              className='rounded-sm font-mono text-xs uppercase tracking-[0.14em]'
            >
              <Link to='/auth/signup'>Create your account</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
