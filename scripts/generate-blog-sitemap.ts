import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE_URL = "https://cxlinux.com";
const SITEMAP_PATH = join(ROOT, "public", "sitemap.xml");

async function main() {
  const files = await glob(join(ROOT, "content", "blog", "*.mdx"));

  const posts: Array<{ slug: string; publishedAt: string; updatedAt?: string; featured: boolean; tags: string[] }> = [];

  for (const file of files) {
    const src = readFileSync(file, "utf-8");
    const { data } = matter(src);
    if (data.draft) continue;
    const slug = file.replace(/^.*\/([^/]+)\.mdx$/, "$1");
    posts.push({ slug, publishedAt: data.publishedAt, updatedAt: data.updatedAt, featured: !!data.featured, tags: data.tags ?? [] });
  }

  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const allTags = [...new Set(posts.flatMap((p) => p.tags))];
  const newestDate = posts[0]?.publishedAt ?? new Date().toISOString().slice(0, 10);

  const urlEntries: string[] = [];

  // Blog index
  urlEntries.push(`  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${newestDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);

  // Individual posts
  for (const post of posts) {
    const lastmod = post.updatedAt ?? post.publishedAt;
    const priority = post.featured ? "0.9" : "0.7";
    urlEntries.push(`  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }

  // Tag pages
  for (const tag of allTags) {
    urlEntries.push(`  <url>
    <loc>${BASE_URL}/blog/tag/${encodeURIComponent(tag)}</loc>
    <lastmod>${newestDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
  }

  // Merge with existing sitemap or create new
  let existingContent = "";
  if (existsSync(SITEMAP_PATH)) {
    existingContent = readFileSync(SITEMAP_PATH, "utf-8")
      .replace(/<\?xml[^>]+\?>/, "")
      .replace(/<urlset[^>]+>/, "")
      .replace(/<\/urlset>/, "")
      // Remove existing blog URLs to avoid duplication
      .replace(/\s*<url>\s*<loc>[^<]*\/blog[^<]*<\/loc>[\s\S]*?<\/url>/g, "");
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${existingContent.trim()}
${urlEntries.join("\n")}
</urlset>`;

  writeFileSync(SITEMAP_PATH, sitemap.trim());
  console.log(`✓ /public/sitemap.xml (${posts.length} posts + ${allTags.length} tags)`);
}

main().catch(console.error);
