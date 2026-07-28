export async function loader() {
  const baseUrl = "https://mystuffs.vercel.app"; // Change this to your real domain!

  // Array of your public routes
  const pages = [
    { path: "", lastmod: "2026-07-24", changefreq: "weekly", priority: "1.0" },
    {
      path: "/features",
      lastmod: "2026-07-20",
      changefreq: "monthly",
      priority: "0.9",
    },
    {
      path: "/pricing",
      lastmod: "2026-07-18",
      changefreq: "monthly",
      priority: "0.8",
    },
    {
      path: "/blog",
      lastmod: "2026-07-24",
      changefreq: "daily",
      priority: "0.8",
    },
  ];

  // Map over the array to generate the XML <url> blocks
  const urls = pages
    .map(
      (page) => `
    <url>
        <loc>${baseUrl}${page.path}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`,
    )
    .join("");

  // Construct the final XML string (No spaces before <?xml!)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
