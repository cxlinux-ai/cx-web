// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadHowToPages, renderAllHowTo } from "@shared/howto/load";
import { MAX_TITLE, extractFaqs, renderBlocks, renderInline, renderManifest } from "@shared/howto/render";
import { shouldServeAsStaticAsset } from "@shared/static-path";
import { onRequest } from "../../../functions/_middleware";

const repoRoot = path.resolve(__dirname, "../../..");
const publicDir = path.join(repoRoot, "client/public");
const pages = loadHowToPages(repoRoot);
const rendered = renderAllHowTo(repoRoot);

function text(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

describe("how-to pages: committed output", () => {
  it("matches the sources (run `npm run build:howto` and commit if this fails)", () => {
    for (const [rel, html] of rendered) {
      expect(readFileSync(path.join(publicDir, rel), "utf8"), rel).toBe(html);
    }
    expect(readFileSync(path.join(repoRoot, "shared/howto/manifest.ts"), "utf8")).toBe(renderManifest(pages.map((p) => p.slug)));
    const committed = readdirSync(path.join(publicDir, "how-to")).map((f) => `how-to/${f}`);
    expect(committed.sort()).toEqual([...rendered.keys()].filter((k) => k.startsWith("how-to/")).sort());
  });

  it("lists every page in the sitemap", () => {
    const sitemap = readFileSync(path.join(publicDir, "sitemap.xml"), "utf8");
    expect(sitemap).toContain("<loc>https://cxlinux.com/how-to</loc>");
    for (const p of pages) expect(sitemap).toContain(`<loc>https://cxlinux.com/how-to/${p.slug}</loc>`);
  });
});

describe("how-to pages: SEO contract", () => {
  it.each(pages.map((p) => [p.slug, p] as const))("%s has search-ready metadata and content", (slug, page) => {
    const html = rendered.get(`how-to/${slug}.html`)!;
    const title = html.match(/<title>([^<]*)<\/title>/)![1].replace(/&amp;/g, "&");
    expect(title.length).toBeLessThanOrEqual(MAX_TITLE);
    expect(page.fm.description.length).toBeGreaterThanOrEqual(120);
    expect(page.fm.description.length).toBeLessThanOrEqual(160);
    expect(html).toContain(`<link rel="canonical" href="https://cxlinux.com/how-to/${slug}">`);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect((html.match(/<h2[\s>]/g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(text(html.slice(html.indexOf("<main"))).split(" ").length).toBeGreaterThanOrEqual(500);
    // The answer comes first: the first block after the intro is a command.
    expect(html.indexOf('<pre class="code"')).toBeLessThan(html.indexOf("<h2"));
  });

  it.each(pages.map((p) => [p.slug, p] as const))("%s has valid structured data with its FAQs", (slug, page) => {
    const html = rendered.get(`how-to/${slug}.html`)!;
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const types = blocks.map((b) => b["@type"]);
    expect(types).toEqual(["TechArticle", "BreadcrumbList", "FAQPage"]);
    const faqs = extractFaqs(page.body);
    expect(faqs.length).toBeGreaterThanOrEqual(3);
    for (const f of faqs) expect(f.answer.length).toBeGreaterThan(20);
    expect(blocks[2].mainEntity).toHaveLength(faqs.length);
  });

  it("links only to pages that exist", () => {
    const valid = new Set(["/", "/getting-started", "/pricing", "/blog", "/about", "/faq", "/privacy", "/terms", "/how-to", ...pages.map((p) => `/how-to/${p.slug}`)]);
    for (const [rel, html] of rendered) {
      const hrefs = [...html.matchAll(/href="(\/[^"#]*)"/g)].map((m) => m[1]).filter((h) => !/\.(svg|png|ico|xml)$/.test(h));
      for (const href of hrefs) expect(valid, `${rel} → ${href}`).toContain(href);
    }
  });

  it("never uses the legacy brand name", () => {
    for (const [rel, html] of rendered) expect(/cortex/i.test(html), rel).toBe(false);
  });

  it("does not describe cx ask behaviour while CX_ASK_RELEASED is false", () => {
    for (const [, html] of rendered) {
      expect(html).not.toContain("cx ask");
      expect(html).toContain('href="/getting-started"');
    }
  });
});

describe("how-to renderer", () => {
  it("escapes HTML and keeps code literal", () => {
    expect(renderInline("Use `<b>` and **bold** [x](/how-to)")).toBe('Use <code>&lt;b&gt;</code> and <strong>bold</strong> <a href="/how-to">x</a>');
  });

  it("splits table cells on unescaped pipes only", () => {
    const html = renderBlocks("| A | B |\n|---|---|\n| `x \\| y` | z |", "");
    expect(html).toContain("<td><code>x | y</code></td><td>z</td>");
  });
});

describe("how-to routing", () => {
  it("treats /how-to paths as static pages", () => {
    expect(shouldServeAsStaticAsset("/how-to")).toBe(true);
    expect(shouldServeAsStaticAsset("/how-to/linux-firewall-ufw")).toBe(true);
    expect(shouldServeAsStaticAsset("/how-to/not-a-guide")).toBe(false);
    expect(shouldServeAsStaticAsset("/how-tox")).toBe(false);
  });

  function context(pathname: string, assets: Record<string, string>) {
    return {
      request: new Request(`https://cxlinux.com${pathname}`),
      next: async () => new Response("next", { status: 404 }),
      env: {
        ASSETS: {
          fetch: async (req: Request | string) => {
            const p = new URL(typeof req === "string" ? req : req.url).pathname;
            const body = assets[p];
            return body === undefined
              ? new Response("missing", { status: 404 })
              : new Response(body, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
          },
        },
      },
    };
  }

  it("serves an existing guide with 200 and security headers", async () => {
    const res = await onRequest(context("/how-to/linux-firewall-ufw", { "/how-to/linux-firewall-ufw": "<h1>guide</h1>" }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("<h1>guide</h1>");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("returns a real 404 with the branded shell for a missing guide, even though the asset server falls back to index.html", async () => {
    const res = await onRequest(context("/how-to/nope", { "/index.html": "<div id=root></div>", "/how-to/nope": "<div id=root></div>" }));
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("<div id=root></div>");
  });
});
