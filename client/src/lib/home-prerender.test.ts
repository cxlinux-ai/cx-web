// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HOME_PRERENDER_HTML, injectPrerender } from "@shared/home-prerender";
import { SECURITY_HEADERS, withSecurityHeaders } from "@shared/security-headers";
import { onRequest } from "../../../functions/_middleware";

const repoRoot = path.resolve(__dirname, "../../..");
const shell = readFileSync(path.join(repoRoot, "client/index.html"), "utf8");
const homeSource = readFileSync(path.join(repoRoot, "client/src/sections/HomePage.tsx"), "utf8");

function visibleText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

describe("homepage prerender", () => {
  const html = injectPrerender(shell, "/");

  it("puts exactly one h1 and several h2 sections in the served HTML", () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect((html.match(/<h2[\s>]/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it("serves at least 300 words of readable copy without JavaScript", () => {
    expect(visibleText(HOME_PRERENDER_HTML).split(" ").length).toBeGreaterThanOrEqual(300);
  });

  it("links to at least 3 internal pages", () => {
    const internal = new Set([...HOME_PRERENDER_HTML.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]));
    expect(internal.size).toBeGreaterThanOrEqual(3);
    for (const href of internal) {
      expect(["/getting-started", "/pricing", "/faq", "/blog", "/about"]).toContain(href);
    }
  });

  it("only uses copy that appears on the rendered homepage", () => {
    const lines = [
      "Stop Googling Linux Commands.",
      "Just Tell CX What You Need.",
      "Set up servers, configure firewalls, deploy apps, in plain English.",
      "Plain English. No man pages, no Stack Overflow, no syntax to memorize.",
      "Every command runs in an isolated execution environment, never touching what it shouldn't.",
      "CX will never run a command without your explicit approval.",
      "Start free, scale as you grow. All paid plans include a 14-day free trial.",
      "Join the CX community",
      "curl -fsSL https://cxlinux.com/install.sh | bash",
    ];
    for (const line of lines) {
      expect(homeSource).toContain(line);
      expect(visibleText(HOME_PRERENDER_HTML)).toContain(line);
    }
  });

  it("leaves other routes and already-filled shells unchanged", () => {
    expect(injectPrerender(shell, "/pricing")).toBe(shell);
    expect(injectPrerender(html, "/")).toBe(html);
  });
});

describe("viewport", () => {
  it("allows pinch-zoom", () => {
    const viewport = shell.match(/<meta name="viewport" content="([^"]+)"/)?.[1] ?? "";
    expect(viewport).toContain("width=device-width");
    expect(viewport).not.toMatch(/user-scalable\s*=\s*no/);
    const max = viewport.match(/maximum-scale\s*=\s*([\d.]+)/)?.[1];
    if (max) expect(Number(max)).toBeGreaterThanOrEqual(2);
  });
});

describe("security headers", () => {
  it("adds HSTS and keeps existing values", () => {
    const res = withSecurityHeaders(new Response("ok", { headers: { "X-Frame-Options": "SAMEORIGIN" } }));
    expect(res.headers.get("Strict-Transport-Security")).toBe("max-age=31536000; includeSubDomains");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
  });

  it("is declared for static assets in _headers too", () => {
    const headersFile = readFileSync(path.join(repoRoot, "client/public/_headers"), "utf8");
    expect(headersFile).toContain(`Strict-Transport-Security: ${SECURITY_HEADERS["Strict-Transport-Security"]}`);
  });
});

describe("Pages middleware", () => {
  const assets = {
    fetch: async (req: Request | string) => {
      const url = new URL(typeof req === "string" ? req : req.url);
      if (url.pathname === "/index.html" || url.pathname === "/") {
        return new Response(shell, { headers: { "Content-Type": "text/html", ETag: '"abc"' } });
      }
      return new Response("nope", { status: 404 });
    },
  };
  const ctx = (path: string, method = "GET") => {
    const request = new Request(`https://cxlinux.com${path}`, { method });
    return { request, env: { ASSETS: assets }, next: () => assets.fetch(request) };
  };

  it("serves / with server-rendered content and security headers", async () => {
    const res = await onRequest(ctx("/"));
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('data-prerender="home"');
    expect(body).toContain("<h1");
    expect(res.headers.get("ETag")).toBeNull();
    expect(res.headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
  });

  it("keeps other SPA routes as the plain shell", async () => {
    const res = await onRequest(ctx("/pricing"));
    expect(res.status).toBe(200);
    expect(await res.text()).not.toContain('data-prerender="home"');
    expect(res.headers.get("Strict-Transport-Security")).not.toBeNull();
  });

  it("keeps 404 and redirect behaviour", async () => {
    expect((await onRequest(ctx("/does-not-exist"))).status).toBe(404);
    const redirect = await onRequest(ctx("/install"));
    expect(redirect.status).toBe(301);
    expect(redirect.headers.get("Location")).toBe("https://cxlinux.com/install.sh");
  });
});
