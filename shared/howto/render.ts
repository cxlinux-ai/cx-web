/**
 * Renders the static /how-to pages from content/how-to/*.md.
 *
 * The pages are plain, fully server-rendered HTML (no JavaScript needed to read them) so every
 * search engine and AI crawler sees the whole article. The source is a small Markdown subset:
 * ## / ### headings, paragraphs, "- " lists, fenced code, pipe tables, `code`, **bold**,
 * [links](/path), and the `<!-- cx -->` marker where the CX box goes.
 *
 * Pure functions only (no file system), so the generator and the drift test render identically.
 */
import { CX_ASK_RELEASED, GA_MEASUREMENT_ID, HOWTO_BASE, SITE_URL } from "./config";

export interface HowToFrontmatter {
  title: string;
  description: string;
  h1: string;
  primary: string;
  cluster: string;
  cxPrompt: string;
  related: string[];
  updated: string;
}

export interface HowToPage {
  slug: string;
  fm: HowToFrontmatter;
  body: string;
}

export interface Faq {
  question: string;
  answer: string;
}

const REQUIRED = ["title", "description", "h1", "primary", "cluster", "cxPrompt", "related", "updated"] as const;

/** Validate raw frontmatter (as parsed by gray-matter) and return typed fields, or throw. */
export function parseFrontmatter(slug: string, data: Record<string, unknown>): HowToFrontmatter {
  for (const key of REQUIRED) {
    if (data[key] === undefined || data[key] === "") throw new Error(`${slug}: missing frontmatter "${key}"`);
  }
  const updated = data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : String(data.updated);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updated)) throw new Error(`${slug}: updated must be YYYY-MM-DD`);
  const related = String(data.related)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    title: String(data.title),
    description: String(data.description),
    h1: String(data.h1),
    primary: String(data.primary),
    cluster: String(data.cluster),
    cxPrompt: String(data.cxPrompt),
    related,
    updated,
  };
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Inline Markdown: `code`, **bold**, [text](href). Input is raw text; output is safe HTML. */
export function renderInline(text: string): string {
  const codes: string[] = [];
  const withPlaceholders = text.replace(/`([^`]+)`/g, (_, code: string) => {
    codes.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  let html = escapeHtml(withPlaceholders);
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) => {
    const external = /^https?:\/\//.test(href);
    return external
      ? `<a href="${href}" rel="noopener">${label}</a>`
      : `<a href="${href}">${label}</a>`;
  });
  return html.replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)]);
}

/** Plain text of an inline string (for JSON-LD and meta): drops Markdown syntax. */
export function plainText(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function splitRow(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === "\\" && inner[i + 1] === "|") {
      cur += "|";
      i++;
    } else if (inner[i] === "|") {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += inner[i];
    }
  }
  cells.push(cur.trim());
  return cells;
}

export function slugifyHeading(text: string): string {
  return plainText(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A code fence opener: three or more backticks and an optional language (`bash`, `shell-session`, `c++`). */
const FENCE_OPEN = /^(`{3,})\s*([\w+#.-]*)\s*$/;

/** Block-level Markdown subset → HTML. `cxBox` replaces the `<!-- cx -->` marker. */
export function renderBlocks(md: string, cxBox: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (line.trim() === "<!-- cx -->") {
      out.push(cxBox);
      i++;
      continue;
    }
    const fence = line.match(FENCE_OPEN);
    if (fence) {
      const ticks = fence[1];
      const lang = fence[2] || "text";
      const close = new RegExp(`^${ticks}\\s*$`);
      const code: string[] = [];
      const start = i + 1;
      i++;
      while (i < lines.length && !close.test(lines[i])) code.push(lines[i++]);
      if (i >= lines.length) throw new Error(`unclosed code fence opened on line ${start}`);
      i++;
      out.push(`<pre class="code" data-lang="${escapeHtml(lang)}"><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level} id="${slugifyHeading(heading[2])}">${renderInline(heading[2])}</h${level}>`);
      i++;
      continue;
    }
    if (line.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(splitRow(lines[i++]));
      const [head, , ...bodyRows] = rows;
      out.push(
        `<div class="table"><table><thead><tr>${head.map((c) => `<th scope="col">${renderInline(c)}</th>`).join("")}</tr></thead>` +
          `<tbody>${bodyRows.map((r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
      );
      continue;
    }
    if (/^- /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2));
      out.push(`<ul>${items.map((it) => `<li>${renderInline(it)}</li>`).join("")}</ul>`);
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !FENCE_OPEN.test(lines[i]) &&
      !/^(#{2,3}\s|- |\|)/.test(lines[i]) &&
      lines[i].trim() !== "<!-- cx -->"
    ) {
      para.push(lines[i++].trim());
    }
    // Every iteration must consume at least one line; anything unrecognised is an authoring error.
    if (para.length === 0) throw new Error(`unsupported Markdown on line ${i + 1}: ${lines[i]}`);
    out.push(`<p>${renderInline(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

/** Questions (### headings) and answers (the paragraphs under them) from the FAQ section. */
export function extractFaqs(body: string): Faq[] {
  const start = body.search(/^## Frequently asked questions\s*$/m);
  if (start === -1) return [];
  const section = body.slice(start).split("\n").slice(1);
  const faqs: Faq[] = [];
  let current: Faq | null = null;
  for (const line of section) {
    if (/^## /.test(line)) break;
    const q = line.match(/^### (.*)$/);
    if (q) {
      current = { question: plainText(q[1]), answer: "" };
      faqs.push(current);
    } else if (current && line.trim()) {
      current.answer = `${current.answer} ${plainText(line)}`.trim();
    }
  }
  return faqs;
}

function cxBox(page: HowToPage): string {
  const prompt = escapeHtml(page.fm.cxPrompt);
  if (CX_ASK_RELEASED) {
    return `<aside class="cx" aria-label="Do it in plain English with CX">
<p class="cx-kicker">Do it in plain English</p>
<pre class="code"><code>cx ask -d "${prompt}"</code></pre>
<p>CX Terminal turns the request into the command, shows you the exact command first, and runs it only after you answer <code>y</code>. Without <code>-d</code> it only shows the command.</p>
<p><a class="cx-link" href="/getting-started">Install CX Terminal &rarr;</a></p>
</aside>`;
  }
  return `<aside class="cx" aria-label="CX Terminal">
<p class="cx-kicker">Prefer plain English?</p>
<p>CX Terminal is building plain-English system administration for Ubuntu and Debian, so tasks like &ldquo;${prompt}&rdquo; start from a sentence instead of a man page.</p>
<p><a class="cx-link" href="/getting-started">See CX Terminal &rarr;</a></p>
</aside>`;
}

const NAV = [
  ["/getting-started", "Terminal"],
  ["/how-to", "How-to"],
  ["/pricing", "Pricing"],
  ["/blog", "Blog"],
  ["/about", "About"],
] as const;

const FOOTER = [
  ["/getting-started", "Terminal"],
  ["/how-to", "Linux how-to guides"],
  ["/blog", "Blog"],
  ["/faq", "FAQ"],
  ["/pricing", "Pricing"],
  ["/about", "About"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
] as const;

const STYLES = `:root{--bg:#0a0a0a;--card:#111;--line:#262626;--text:#f5f5f5;--muted:#a3a3a3;--accent:#00ff9f;--mono:'Fira Code','JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;--sans:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.7 var(--sans)}
a{color:var(--accent);text-underline-offset:3px}a:hover{color:#00cc7f}
.skip{position:absolute;left:-999px}.skip:focus{left:16px;top:8px;background:var(--accent);color:#000;padding:6px 10px;z-index:10}
header.site{border-bottom:1px solid var(--line)}.bar{max-width:1080px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.brand{font-weight:700;color:var(--text);text-decoration:none;font-size:18px;letter-spacing:.02em}.brand span{color:var(--accent)}
nav.main ul{list-style:none;display:flex;gap:18px;margin:0;padding:0;flex-wrap:wrap}nav.main a{color:var(--muted);text-decoration:none;font-size:14px}nav.main a:hover,nav.main a[aria-current]{color:var(--text)}
main{max-width:760px;margin:0 auto;padding:32px 20px 64px}
.crumbs{font-size:13px;color:var(--muted);margin:0 0 18px}.crumbs a{color:var(--muted)}.crumbs ol{list-style:none;padding:0;margin:0;display:flex;gap:8px;flex-wrap:wrap}.crumbs li+li:before{content:"/";margin-right:8px;color:#525252}
h1{font-size:clamp(28px,5vw,40px);line-height:1.15;margin:0 0 10px;letter-spacing:-.01em}
.meta{color:var(--muted);font-size:14px;margin:0 0 28px}
h2{font-size:24px;line-height:1.3;margin:44px 0 12px}h3{font-size:18px;margin:28px 0 8px}
p,ul{margin:0 0 16px}li{margin:4px 0}
code{font-family:var(--mono);font-size:.88em;background:#1a1a1a;border:1px solid var(--line);border-radius:4px;padding:1px 5px}
pre.code{background:#0d0d0d;border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:8px;padding:14px 16px;overflow-x:auto;margin:0 0 20px}
pre.code code{background:none;border:0;padding:0;font-size:14px;line-height:1.6;color:#e5e5e5;white-space:pre}
.table{overflow-x:auto;margin:0 0 20px}table{border-collapse:collapse;width:100%;font-size:15px}th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}th{color:var(--muted);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.04em}
.cx{background:linear-gradient(180deg,rgba(0,255,159,.07),rgba(0,255,159,.02));border:1px solid rgba(0,255,159,.35);border-radius:12px;padding:18px 20px;margin:8px 0 28px}
.cx-kicker{margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}.cx p:last-child{margin:0}.cx-link{font-weight:600}
.related{border-top:1px solid var(--line);margin-top:48px;padding-top:24px}.related ul{list-style:none;padding:0;display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.related a,.card a{display:block;border:1px solid var(--line);border-radius:10px;padding:12px 14px;text-decoration:none;color:var(--text);background:var(--card)}.related a:hover,.card a:hover{border-color:var(--accent)}
.card small{display:block;color:var(--muted);font-size:13px;margin-top:4px;line-height:1.5}
.cluster{margin-top:36px}.cluster ul{list-style:none;padding:0;display:grid;gap:10px}
footer.site{border-top:1px solid var(--line);color:var(--muted);font-size:14px}footer.site .bar{justify-content:space-between}footer.site ul{list-style:none;display:flex;gap:16px;flex-wrap:wrap;margin:0;padding:0}footer.site a{color:var(--muted);text-decoration:none}footer.site a:hover{color:var(--text)}
@media (max-width:600px){main{padding:24px 16px 48px}.bar{padding:12px 16px;gap:12px}h2{font-size:21px}}`;

function layout(opts: {
  title: string;
  description: string;
  path: string;
  jsonLd: unknown[];
  body: string;
  currentNav?: string;
}): string {
  const url = `${SITE_URL}${opts.path}`;
  const nav = NAV.map(
    ([href, label]) =>
      `<li><a href="${href}"${href === opts.currentNav ? ' aria-current="page"' : ""}>${label}</a></li>`,
  ).join("");
  const footer = FOOTER.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("");
  const ld = opts.jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
<meta name="description" content="${escapeHtml(opts.description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${escapeHtml(opts.title)}">
<meta property="og:description" content="${escapeHtml(opts.description)}">
<meta property="og:image" content="${SITE_URL}/og-image.png?v=2">
<meta property="og:site_name" content="CX Linux">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@cxlinux">
<meta name="theme-color" content="#00FF9F">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">
<style>${STYLES}</style>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{anonymize_ip:true,cookie_flags:'SameSite=None;Secure'});</script>
${ld}
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
<header class="site"><div class="bar"><a class="brand" href="/">CX<span>.</span> Linux</a><nav class="main" aria-label="Primary"><ul>${nav}</ul></nav></div></header>
<main id="content">
${opts.body}
</main>
<footer class="site"><div class="bar"><span>&copy; CX Linux &middot; AI Venture Holdings LLC</span><nav aria-label="Footer"><ul>${footer}</ul></nav></div></footer>
</body>
</html>
`;
}

function breadcrumbLd(items: Array<[string, string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_URL}${path}`,
    })),
  };
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[m - 1]} ${d}, ${y}`;
}

function renderBody(page: HowToPage): string {
  try {
    return renderBlocks(page.body, cxBox(page));
  } catch (err) {
    throw new Error(`content/how-to/${page.slug}.md: ${(err as Error).message}`);
  }
}

/** Search results cut titles near 60 characters, so the brand suffix is added only when it fits. */
export const MAX_TITLE = 60;
export function pageTitle(title: string): string {
  const branded = `${title} | CX Linux`;
  return branded.length <= MAX_TITLE ? branded : title;
}

/** One how-to page. `bySlug` resolves related links to titles. */
export function renderHowToPage(page: HowToPage, bySlug: Map<string, HowToPage>): string {
  const path = `${HOWTO_BASE}/${page.slug}`;
  const faqs = extractFaqs(page.body);
  const related = page.fm.related.map((slug) => {
    const target = bySlug.get(slug);
    if (!target) throw new Error(`${page.slug}: related page "${slug}" does not exist`);
    return target;
  });
  const jsonLd: unknown[] = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: page.fm.h1,
      description: page.fm.description,
      dateModified: page.fm.updated,
      inLanguage: "en",
      mainEntityOfPage: `${SITE_URL}${path}`,
      author: { "@type": "Organization", name: "CX Linux", url: SITE_URL },
      publisher: { "@type": "Organization", name: "CX Linux", url: SITE_URL, logo: `${SITE_URL}/logo.png` },
      about: page.fm.primary,
    },
    breadcrumbLd([
      ["Home", "/"],
      ["How-to", HOWTO_BASE],
      [page.fm.h1, path],
    ]),
  ];
  if (faqs.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    });
  }
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="${HOWTO_BASE}">How-to</a></li><li aria-current="page">${escapeHtml(page.fm.h1)}</li></ol></nav>
<article>
<h1>${escapeHtml(page.fm.h1)}</h1>
<p class="meta">Ubuntu &amp; Debian &middot; Updated <time datetime="${page.fm.updated}">${formatDate(page.fm.updated)}</time></p>
${renderBody(page)}
</article>
<section class="related" aria-labelledby="related-heading">
<h2 id="related-heading">Related guides</h2>
<ul>${related.map((r) => `<li><a href="${HOWTO_BASE}/${r.slug}">${escapeHtml(r.fm.h1)}</a></li>`).join("")}</ul>
</section>`;
  return layout({ title: pageTitle(page.fm.title), description: page.fm.description, path, jsonLd, body, currentNav: HOWTO_BASE });
}

/** Ordering of clusters on the hub page. */
const CLUSTER_ORDER = ["Server operations", "System info & monitoring", "Shell & automation", "Networking", "Learning"];

/** The /how-to hub: every guide, grouped by cluster. */
export function renderHowToIndex(pages: HowToPage[]): string {
  const clusters = Array.from(new Set(pages.map((p) => p.fm.cluster))).sort(
    (a, b) => (CLUSTER_ORDER.indexOf(a) + 1 || 99) - (CLUSTER_ORDER.indexOf(b) + 1 || 99),
  );
  const description =
    "Practical Linux how-to guides for Ubuntu and Debian servers: security, firewalls, updates, logs, backups, Docker, services, cron and everyday commands.";
  const groups = clusters
    .map((cluster) => {
      const items = pages
        .filter((p) => p.fm.cluster === cluster)
        .map((p) => `<li class="card"><a href="${HOWTO_BASE}/${p.slug}">${escapeHtml(p.fm.h1)}<small>${escapeHtml(p.fm.description)}</small></a></li>`)
        .join("");
      return `<section class="cluster" aria-labelledby="c-${slugifyHeading(cluster)}"><h2 id="c-${slugifyHeading(cluster)}">${escapeHtml(cluster)}</h2><ul>${items}</ul></section>`;
    })
    .join("\n");
  const jsonLd: unknown[] = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Linux how-to guides",
      description,
      url: `${SITE_URL}${HOWTO_BASE}`,
      hasPart: pages.map((p) => ({ "@type": "TechArticle", headline: p.fm.h1, url: `${SITE_URL}${HOWTO_BASE}/${p.slug}` })),
    },
    breadcrumbLd([
      ["Home", "/"],
      ["How-to", HOWTO_BASE],
    ]),
  ];
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">How-to</li></ol></nav>
<h1>Linux how-to guides</h1>
<p class="meta">For Ubuntu and Debian servers. Each guide gives the exact commands first, then explains them.</p>
${groups}`;
  return layout({ title: "Linux How-To Guides for Ubuntu & Debian Servers | CX Linux", description, path: HOWTO_BASE, jsonLd, body, currentNav: HOWTO_BASE });
}

/** Source of shared/howto/manifest.ts: the exact paths the Pages middleware serves as guides. */
export function renderManifest(slugs: string[]): string {
  const paths = [HOWTO_BASE, `${HOWTO_BASE}/`, ...slugs.map((s) => `${HOWTO_BASE}/${s}`)];
  return `// Generated by scripts/generate-howto.ts — do not edit. Paths served as static /how-to pages.\n` +
    `export const HOWTO_PATHS: ReadonlySet<string> = new Set([\n${paths.map((p) => `  ${JSON.stringify(p)},`).join("\n")}\n]);\n`;
}
