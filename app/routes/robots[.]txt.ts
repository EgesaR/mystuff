import type { Route } from "./+types/robots[.]txt";
import { SITE_URL } from "~/lib/seo";

export async function loader(_args: Route.LoaderArgs) {
  const body = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
