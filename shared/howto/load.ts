/**
 * Reads content/how-to/*.md and renders every page. Node-only (uses the file system); shared by
 * scripts/generate-howto.ts and the drift test so both produce byte-identical output.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parseFrontmatter, renderHowToIndex, renderHowToPage, type HowToPage } from "./render";

export function loadHowToPages(repoRoot: string): HowToPage[] {
  const dir = path.join(repoRoot, "content", "how-to");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const parsed = matter(readFileSync(path.join(dir, file), "utf8"));
      return { slug, fm: parseFrontmatter(slug, parsed.data), body: parsed.content.trim() };
    });
}

/** Map of output path (relative to client/public) → HTML. */
export function renderAllHowTo(repoRoot: string): Map<string, string> {
  const pages = loadHowToPages(repoRoot);
  const bySlug = new Map(pages.map((p) => [p.slug, p]));
  const files = new Map<string, string>();
  files.set("how-to.html", renderHowToIndex(pages));
  for (const page of pages) files.set(`how-to/${page.slug}.html`, renderHowToPage(page, bySlug));
  return files;
}
