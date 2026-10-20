import { isSpaRoute } from "./spa-routes";
import { shouldServeAsStaticAsset } from "./static-path";
import { injectPrerender } from "../shared/home-prerender";
import { withSecurityHeaders } from "../shared/security-headers";

interface PagesEnv {
  ASSETS: { fetch: (request: Request | string) => Promise<Response> };
}

type PagesContext = {
  request: Request;
  next: () => Promise<Response>;
  env: PagesEnv;
};

async function fetchIndexHtml(
  env: PagesEnv,
  url: URL,
  request: Request,
): Promise<Response | null> {
  // Strip conditional headers: a 304 from the asset store is not a usable app shell, and
  // treating it as a miss turned browser reloads (If-None-Match) into "Not Found".
  const shellHeaders = new Headers(request.headers);
  shellHeaders.delete("If-None-Match");
  shellHeaders.delete("If-Modified-Since");
  const indexRequest = new Request(new URL("/index.html", url), {
    method: "GET",
    headers: shellHeaders,
    redirect: "manual",
  });
  const indexResponse = await env.ASSETS.fetch(indexRequest);
  if (indexResponse.status === 308 || indexResponse.status === 301 || indexResponse.status === 302) {
    const location = indexResponse.headers.get("Location");
    if (location === "/" || location === url.origin + "/") {
      const rootResponse = await env.ASSETS.fetch(new Request(new URL("/", url), { method: "GET", headers: shellHeaders }));
      if (rootResponse.ok) {
        return rootResponse;
      }
    }
  }
  if (!indexResponse.ok) {
    return null;
  }
  const headers = new Headers(indexResponse.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(indexResponse.body, { status: 200, headers });
}

/** Legacy short install URL that shipped on the homepage and Getting Started page. */
const INSTALL_ALIASES = new Set(["/install", "/install/"]);

/**
 * Unknown paths: real HTTP 404, but render the app shell so the branded NotFound page
 * (with a link home and robots noindex) shows instead of a bare text response.
 */
async function notFound(env: PagesEnv, url: URL, request: Request): Promise<Response> {
  const shell = shouldServeAsStaticAsset(url.pathname) ? null : await fetchIndexHtml(env, url, request);
  if (!shell) {
    return new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  return new Response(request.method === "HEAD" ? null : shell.body, { status: 404, headers: shell.headers });
}

/** Serve "/" with its server-rendered content in place of the empty SPA mount point. */
async function withHomePrerender(response: Response, request: Request): Promise<Response> {
  if (response.status !== 200 || !(response.headers.get("Content-Type") ?? "").includes("text/html")) {
    return response;
  }
  const html = injectPrerender(await response.text(), "/");
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  // The body differs from the stored asset, so its validators no longer describe it.
  headers.delete("Content-Length");
  headers.delete("ETag");
  return new Response(request.method === "HEAD" ? null : html, { status: 200, headers });
}

export const onRequest = async (context: PagesContext): Promise<Response> =>
  withSecurityHeaders(await route(context));

async function route(context: PagesContext): Promise<Response> {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  if (INSTALL_ALIASES.has(pathname)) {
    return Response.redirect(new URL("/install.sh", url).toString(), 301);
  }

  if (shouldServeAsStaticAsset(pathname)) {
    const staticResponse = await context.env.ASSETS.fetch(context.request);
    if (staticResponse.status !== 404) {
      return staticResponse;
    }
  }

  if (!isSpaRoute(pathname)) {
    return notFound(context.env, url, context.request);
  }

  if (pathname === "/") {
    const root = await context.next();
    if (root.ok) {
      return withHomePrerender(root, context.request);
    }
    const index = await fetchIndexHtml(context.env, url, context.request);
    return index ? withHomePrerender(index, context.request) : root;
  }

  const index = await fetchIndexHtml(context.env, url, context.request);
  if (index) {
    return index;
  }

  const fallback = await context.next();
  if (fallback.ok) {
    return fallback;
  }

  return notFound(context.env, url, context.request);
}
