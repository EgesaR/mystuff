import { Link } from "react-router";
import type { Route } from "./+types/about";

import { ArrowRight, Code2 } from "lucide-react";

import { buildMeta } from "~/lib/seo";

import SiteHeader from "~/features/site/components/SiteHeader";
import SiteFooter from "~/features/site/components/SiteFooter";

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "About",
    description:
      "Why My Stuff exists: a personal workspace built for people who accumulate more notes and files than any single app was designed to hold.",
    path: "/about",
  });

const About = () => {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <SiteHeader />

      <main className='mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20'>
        <p className='font-mono text-xs uppercase tracking-[0.2em] text-primary'>
          About
        </p>

        <h1
          className='mt-4 text-4xl leading-tight tracking-tight text-foreground sm:text-5xl'
          style={{
            fontFamily: "'Fraunces', serif",
          }}
        >
          Built because ten tabs isn't a system.
        </h1>

        <div className='mt-10 space-y-6 text-lg leading-relaxed text-muted-foreground'>
          <p>
            My Stuff started as a single question: where does a note actually
            live once you've written it? Not "which app" — which folder, which
            collection, which conversation it belongs to. Most tools answer that
            with a search bar and hope. My Stuff answers it with a place.
          </p>

          <p>
            It's a personal workspace for notes, files, and the collections that
            tie them together — built with a rich text editor that keeps its
            formatting, real-time presence so you can see who else is looking at
            something, and sharing that expires when you want it to, not
            whenever you remember to revoke it.
          </p>

          <p>
            It's built and maintained by one developer, in the open, one feature
            at a time — which means it changes based on what actually gets used,
            not what looks good on a roadmap slide.
          </p>
        </div>

        <div className='mt-12 rounded-sm border border-l-4 border-l-primary bg-card p-6 shadow-sm'>
          <div className='flex items-center gap-2'>
            <Code2 className='size-4 text-primary' />

            <p className='font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground'>
              Under the hood
            </p>
          </div>

          <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
            FastAPI and SQLAlchemy on the backend, React Router and TypeScript
            on the front — with WebSockets carrying presence and notifications
            in real time.
          </p>

          <div className='mt-4 flex flex-wrap gap-4'>
            <Link
              to='/docs'
              className='inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4'
            >
              Read the docs
              <ArrowRight className='size-3.5' />
            </Link>

            <Link
              to='/contact'
              className='inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4'
            >
              Get in touch
              <ArrowRight className='size-3.5' />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default About;
