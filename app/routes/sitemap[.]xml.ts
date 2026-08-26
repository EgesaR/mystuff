import type { Route } from "./+types/sitemap[.]xml";
import { apiFetch } from "~/lib/api/server";
import { SITE_URL } from "~/lib/seo";

interface Slugged {
  slug: string;
}

const STATIC_PATHS = ["/", "/about", "/docs", "/blog", "/contact"];

export async function loader(_args: Route.LoaderArgs) {
  const [posts, docs] = await Promise.all([
    apiFetch<Slugged[]>("/blog").catch(() => []),
    apiFetch<Slugged[]>("/docs").catch(() => []),
  ]);

  const urls = [
    ...STATIC_PATHS,
    ...posts.map((post) => `/blog/${post.slug}`),
    ...docs.map((doc) => `/docs/${doc.slug}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
