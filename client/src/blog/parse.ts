import { PostFrontmatterSchema, type BlogPost, type PostFrontmatter } from "./schema";

type MdxModule = {
  default: React.ComponentType;
  frontmatter: Record<string, unknown>;
};

const modules = import.meta.glob<MdxModule>("../../../content/blog/*.mdx");

function slugFromPath(path: string): string {
  return path.replace(/^.*\/([^/]+)\.mdx$/, "$1");
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

let _cache: BlogPost[] | null = null;

export async function getAllPosts(): Promise<BlogPost[]> {
  if (_cache) return _cache;

  const entries = await Promise.all(
    Object.entries(modules).map(async ([path, load]) => {
      const mod = await load();
      const slug = slugFromPath(path);

      const result = PostFrontmatterSchema.safeParse(mod.frontmatter);
      if (!result.success) {
        console.error(`[blog] Invalid frontmatter in ${path}:`, result.error.flatten());
        return null;
      }

      const fm = result.data;

      if (import.meta.env.PROD && fm.draft) return null;

      // Approximate body word count from description (full body lives in the compiled component).
      // For accurate counts, set `readingTimeMinutes` in the post frontmatter.
      const descWords = countWords(fm.description);
      const estimatedWords = Math.max(800, descWords * 50);
      const readingTimeMinutes = fm.readingTimeMinutes ?? Math.max(1, Math.ceil(estimatedWords / 220));
      const wordCount = estimatedWords;

      return { slug, frontmatter: fm, readingTimeMinutes, wordCount } satisfies BlogPost;
    })
  );

  _cache = (entries.filter(Boolean) as BlogPost[]).sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime()
  );

  return _cache;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug);
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((p) =>
    p.frontmatter.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getAllPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.frontmatter.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getRelatedPosts(post: BlogPost, max = 3): Promise<BlogPost[]> {
  const all = await getAllPosts();
  const postTags = new Set(post.frontmatter.tags.map((t) => t.toLowerCase()));

  const ranked = all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      post: p,
      score: p.frontmatter.tags.filter((t) => postTags.has(t.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score || new Date(b.post.frontmatter.publishedAt).getTime() - new Date(a.post.frontmatter.publishedAt).getTime())
    .slice(0, max)
    .map((x) => x.post);

  return ranked;
}

export async function getMdxComponent(slug: string): Promise<React.ComponentType | null> {
  const entry = Object.entries(modules).find(([path]) => slugFromPath(path) === slug);
  if (!entry) return null;
  const mod = await entry[1]();
  return mod.default;
}
