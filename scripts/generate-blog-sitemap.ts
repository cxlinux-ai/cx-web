import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import matter from "gray-matter";
import { PostFrontmatterSchema } from "../client/src/blog/schema";

/**
 * Single source of truth for /sitemap.xml.
 *
 * Writes client/public/sitemap.xml, which Vite copies into dist/public at build time.
 * Blog posts are included only if they pass the same frontmatter schema the site uses to
 * render them (client/src/blog/parse.ts), so the sitemap can never list a URL that renders
 * "Post Not Found".
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE_URL = "https://cxlinux.com";
const SITEMAP_PATH = join(ROOT, "client", "public", "sitemap.xml");

/** Indexable app routes. Keep in sync with client/src/App.tsx; noindex routes are excluded. */
const STATIC_ROUTES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/getting-started", changefreq: "weekly", priority: "0.9" },
  { path: "/pricing", changefreq: "weekly", priority: "0.9" },
  { path: "/pricing/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/affiliates", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function main() {
  const files = (await glob(join(ROOT, "content", "blog", "*.mdx"))).sort();
  const today = new Date().toISOString().slice(0, 10);

  const posts: Array<{ slug: string; lastmod: string; featured: boolean; tags: string[] }> = [];
  const skipped: string[] = [];

  for (const file of files) {
    const slug = file.replace(/^.*\/([^/]+)\.mdx$/, "$1");
    const result = PostFrontmatterSchema.safeParse(matter(readFileSync(file, "utf-8")).data);
    if (!result.success) {
      skipped.push(`${slug} (invalid frontmatter)`);
      continue;
    }
    const fm = result.data;
    if (fm.draft) {
      skipped.push(`${slug} (draft)`);
      continue;
    }
    posts.push({ slug, lastmod: fm.updatedAt ?? fm.publishedAt, featured: fm.featured, tags: fm.tags });
  }

  posts.sort((a, b) => b.lastmod.localeCompare(a.lastmod));
  const newest = posts[0]?.lastmod ?? today;
  const tags = [...new Set(posts.flatMap((p) => p.tags))].sort();

  const url = (loc: string, lastmod: string, changefreq: string, priority: string) =>
    `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

  const entries = [
    ...STATIC_ROUTES.map((r) => url(`${BASE_URL}${r.path}`, r.path === "/blog" ? newest : today, r.changefreq, r.priority)),
    ...posts.map((p) => url(`${BASE_URL}/blog/${p.slug}`, p.lastmod, "monthly", p.featured ? "0.9" : "0.7")),
    ...tags.map((t) => url(`${BASE_URL}/blog/tag/${encodeURIComponent(t)}`, newest, "weekly", "0.5")),
  ];

  writeFileSync(
    SITEMAP_PATH,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`,
  );

  console.log(`✓ client/public/sitemap.xml (${STATIC_ROUTES.length} pages, ${posts.length} posts, ${tags.length} tags)`);
  if (skipped.length) console.warn(`  skipped: ${skipped.join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
