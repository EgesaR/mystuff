import type { MetaDescriptor } from "react-router";

export const SITE_NAME = "My Stuff";
export const SITE_URL = "https://mystuffs.vercel.app";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

export interface SeoInput {
  /**
   * Page title.
   */
  title: string;
  /**
   * 120-160 char summary used for the meta description and OG/Twitter cards.
   */
  description: string;
  /**
   * Route path, e.g. "/blog/my-post" - used to build the canonical + OG url.
   */
  path: string;
  image?: string;
  type?: "website" | "article";
  keywords?: readonly string[];
  /**
   * Set true for pages you don't want indexed (drafts, thank-you pages, etc).
   */
  noIndex?: boolean;
}

export function buildMeta({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  keywords,
  noIndex = false,
}: SeoInput): MetaDescriptor[] {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === "/" ? title : `${title} · ${SITE_NAME}`;

  return [
    { title: fullTitle },
    { name: "description", content: description },
    ...(keywords?.length
      ? [{ name: "keywords", content: keywords.join(",") }]
      : []),
    { name: "robots", content: noIndex ? "noindex, nofollow" : "index follow" },
    // Canonical link.
    { tagName: "link", rel: "canonical", href: url },

    // OPen Graph
    { property: "og:type", content: type },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:image", content: image },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ] as MetaDescriptor[];
}

/**
 * Safe helper for embedding JSON-LD structured data via dangerouslySetInnerHTML.
 */
export function jsonLd(data: Record<string, unknown>) {
  return { __html: JSON.stringify(data) };
}
