import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import matter from "gray-matter";
import { Feed } from "feed";
import { PostFrontmatterSchema } from "../client/src/blog/schema";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE_URL = "https://cxlinux.com";

const RSS_OUT_DIRS = [join(ROOT, "client", "public", "blog")];
for (const dir of RSS_OUT_DIRS) {
  mkdirSync(dir, { recursive: true });
}

async function main() {
  const files = await glob(join(ROOT, "content", "blog", "*.mdx"));

  const posts: Array<{ slug: string; data: Record<string, any>; body: string }> = [];

  for (const file of files) {
    const src = readFileSync(file, "utf-8");
    const { data, content } = matter(src);
    if (data.draft || !PostFrontmatterSchema.safeParse(data).success) continue;
    const slug = file.replace(/^.*\/([^/]+)\.mdx$/, "$1");
    posts.push({ slug, data, body: content });
  }

  posts.sort((a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime());

  const feed = new Feed({
    title: "CX Linux Blog",
    description: "Tutorials, architecture deep-dives, and practical guides for AI-powered Linux engineering.",
    id: `${BASE_URL}/blog`,
    link: `${BASE_URL}/blog`,
    language: "en",
    image: `${BASE_URL}/og-image.png`,
    favicon: `${BASE_URL}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} AI Venture Holdings LLC`,
    feedLinks: { rss2: `${BASE_URL}/blog/rss.xml` },
    author: { name: "CX Linux Team", link: BASE_URL },
  });

  for (const { slug, data, body } of posts) {
    const url = `${BASE_URL}/blog/${slug}`;
    const rawOg = data.ogImage as string | undefined;
    const ogImage =
      rawOg && /^https?:\/\//i.test(rawOg)
        ? rawOg
        : rawOg
          ? `${BASE_URL}${rawOg.startsWith("/") ? rawOg : `/${rawOg}`}`
          : `${BASE_URL}/og/${slug}.png`;
    // Strip MDX components for the feed — render as plain text
    const plainBody = body
      .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, "")
      .replace(/<[A-Z][^/]*/g, "")
      .replace(/^import .+$/gm, "")
      .trim();

    feed.addItem({
      title: data.title,
      id: url,
      link: url,
      description: data.description,
      content: `<p>${data.description}</p><p><a href="${url}">Read the full article →</a></p>`,
      author: [{ name: "CX Linux Team", link: BASE_URL }],
      date: new Date(data.publishedAt),
      image: ogImage,
    });
  }

  const rss = feed.rss2();
  for (const dir of RSS_OUT_DIRS) {
    writeFileSync(join(dir, "rss.xml"), rss);
  }
  console.log(`✓ client/public/blog/rss.xml (${posts.length} posts)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
