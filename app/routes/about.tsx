import React from 'react'
import type { Route } from './+types/about';
import { buildMeta } from '~/lib/seo';
import SiteHeader from '~/features/site/components/SiteHeader';
import { Link } from 'react-router';
import SiteFooter from '~/features/site/components/SiteFooter';

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "About",
    description:
      "Why My Stuff exists: a personal workspace built for people who accumulate more notes and files than any single app was designed to hold.",
    path: "/about",
  });

const About = () => {
  return (
    <div className="min-h-screen bg-[#F2F1EC] text-[#1C2321]">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F5D50]">
          About
        </p>
        <h1
          className="mt-4 text-4xl text-[#1C2321] sm:text-5xl"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Built because ten tabs isn't a system.
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-[#5B5A50]">
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

        <div
          className="mt-12 rounded-sm border border-[#C9C4B7] bg-[#F8F7F2] p-6"
          style={{ borderLeft: "4px solid #2F5D50" }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8A8676]">
            Under the hood
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#5B5A50]">
            FastAPI and SQLAlchemy on the backend, React Router and TypeScript
            on the front — with WebSockets carrying presence and notifications
            in real time. Read the{" "}
            <Link
              to="/docs"
              className="text-[#2F5D50] underline underline-offset-2"
            >
              docs
            </Link>{" "}
            for the details, or{" "}
            <Link
              to="/contact"
              className="text-[#2F5D50] underline underline-offset-2"
            >
              get in touch
            </Link>{" "}
            if something's missing.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default About
