import { buildMeta, jsonLd, SITE_URL } from "~/lib/seo";
import type { Route } from "./+types/_index";
import {
  FolderClosed,
  Layers,
  MessageSquare,
  NotebookPen,
  Share2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { HexColor } from "~/types";
import { motion } from "framer-motion";
import SiteHeader from "~/features/site/components/SiteHeader";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import SiteFooter from "~/features/site/components/SiteFooter";

export const meta: Route.MetaFunction = () =>
  buildMeta({
    title: "My Stuff — File your notes, files, and ideas in one place",
    description:
      "My Stuff is a personal workspace for notes, files, and collections — with real-time editing, sharing, and comments. Organize everything you keep, and actually find it again.",
    path: "/",
    keywords: [
      "personal notes app",
      "file management app",
      "note taking software",
      "real-time collaboration notes",
      "digital file organizer",
    ],
  });

const FEATURES: {
  code: string;
  icon: LucideIcon;
  title: string;
  body: string;
  tab: HexColor;
}[] = [
  {
    code: "F-01",
    icon: NotebookPen,
    title: "Notes that hold their shape",
    body: "A rich text editor with inline comments, @mentions, and a find-and-replace that actually works — export to Markdown or Word whenever you need to leave.",
    tab: "#2F5D50",
  },
  {
    code: "F-02",
    icon: FolderClosed,
    title: "Files, filed properly",
    body: "Drag, drop, lasso-select, and merge folders without losing track. Every file gets a preview, a home, and a way back to you.",
    tab: "#C98A2B",
  },
  {
    code: "F-03",
    icon: Layers,
    title: "Collections, not just folders",
    body: "Group notes and files by project, not just by location — the same file can live in three collections without being copied three times.",
    tab: "#1C2321",
  },
  {
    code: "F-04",
    icon: Users,
    title: "Presence, without the awkwardness",
    body: "See who else is looking at a note right now, with a cursor and a name — no more \u201cwait, are you editing this too?\u201d messages.",
    tab: "#2F5D50",
  },
  {
    code: "F-05",
    icon: Share2,
    title: "Sharing with an expiry date",
    body: "Send a scoped, revocable link instead of a copy. Share a folder, a note, or a single file — and pull it back whenever you want.",
    tab: "#C98A2B",
  },
  {
    code: "F-06",
    icon: MessageSquare,
    title: "Comments that reach people",
    body: "@mention a collaborator inline and they get notified — on the page, not buried in an inbox they'll open next week.",
    tab: "#1C2321",
  },
] as const;

const STACK_CARDS = [
  {
    code: "F-01",
    title: "Notes",
    body: "Rich text, live cursors, comments that @mention.",
    tab: "#2F5D50",
  },
  {
    code: "F-02",
    title: "Files",
    body: "Drag, drop, tag, and preview anything you keep.",
    tab: "#C98A2B",
  },
  {
    code: "F-03",
    title: "Collections",
    body: "Group loose ends into something you can find again.",
    tab: "#1C2321",
  },
  {
    code: "F-04",
    title: "Presence",
    body: "See who's editing, in real time, without asking.",
    tab: "#2F5D50",
  },
] as const;

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
] as const;

const IndexCardStack = () => {
  return (
    <div className="relative mx-auto h-90 w-full max-w-sm sm:h-100">
      {STACK_CARDS.map((card, i) => (
        <motion.div
          key={card.code}
          className="absolute inset-x-4 top-0 rounded-sm border border-[#C9C4B7] bg-[#F8F7F2] p-5"
          style={{ borderTop: `4px solid ${card.tab}` }}
          initial={{ opacity: 0, y: 40, rotate: 0 }}
          animate={{ opacity: 1, y: i * 24, rotate: (i - 1.5) * 2.5 }}
          transition={{
            delay: 0.15 + i * 0.12,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{ rotate: 0, y: i * 24 - 10, zIndex: 20 }}
        >
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A8676]">
            <span>{card.code}</span>
            <span>My Stuff</span>
          </div>
          <h3
            className="mt-3 text-2xl text-[#1C2321]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {card.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#5B5A50]">
            {card.body}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-[#F2F1EC] text-[#1C2321]">
      <script
        type="application/ld+json"
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
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        })}
      ></script>
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F5D50]">
              Personal wworkspace, cataloged
            </p>
            <h1
              className="mt-4 text-5xl leading-[1.05] text-[#1C2321] sm:text-6xl"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Everything you keep, <br /> finally filled.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#5B5A50]">
              My Stuff is where notes, files and half-finished ideas stop
              scattering across ten different apps - and start living somewhere
              you can actually find them again.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size={"lg"}
                className="rounded-sm bg-[#2F5D50] font-mono text-xs uppercase tracking-[0.14em] text-[#F2F1EC] hover:bg-[#26493F]"
              >
                <Link to="/auth/signup">Start filling - it's free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-sm border-[#C9C4B7] font-mono text-xs uppercase tracking-[0.14em] text-[#1C2321] hover:bg-[#E7E4D9]"
              >
                <Link to="/docs">Read the docs</Link>
              </Button>
            </div>
          </div>
          <IndexCardStack />
        </section>

        {/* Feature catalog */}
        <section className="border-t border-[#C9C4B7] bg-[#EDEBE1]">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F5D50]">
                The catalog
              </p>
              <h2
                className="mt-3 text-3xl text-[#1C2321] sm:text-4xl"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Six drawers. One desk.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.code}
                  className="rounded-sm border border-[#C9C4B7] bg-[#F8F7F2] p-6"
                  style={{ borderLeft: `4px solid ${feature.tab}` }}
                >
                  <div className="flex items-center justify-between">
                    <feature.icon
                      className="h-5 w-5 text-[#2F5D50]"
                      strokeWidth={1.5}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A8676]">
                      {feature.code}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#1C2321]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5B5A50]">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* How it works */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F5D50]">
            How it works
          </p>
          <h2
            className="mt-3 max-w-xl text-3xl text-[#1C2321] sm:text-4xl"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            No system to learn before you start.
          </h2>

          <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-[#C9C4B7] bg-[#C9C4B7] sm:grid-cols-3">
            {WORKFLOW.map((step) => (
              <div key={step.label} className="bg-[#F8F7F2] p-8">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#2F5D50]">
                  {step.label}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-[#5B5A50]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section className="border-t border-[#C9C4B7] bg-[#1C2321]">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
            <h2
              className="max-w-md text-3xl text-[#F2F1EC] sm:text-4xl"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Open a drawer. See what fits.
            </h2>
            <Button
              asChild
              size="lg"
              className="rounded-sm bg-[#F2F1EC] font-mono text-xs uppercase tracking-[0.14em] text-[#1C2321] hover:bg-[#E7E4D9]"
            >
              <Link to="/signup">Create your account</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
