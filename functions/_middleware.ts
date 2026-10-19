import { isSpaRoute } from "./spa-routes";
import { shouldServeAsStaticAsset } from "./static-path";

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
  const indexRequest = new Request(new URL("/index.html", url), {
    method: "GET",
    headers: request.headers,
    redirect: "manual",
  });
  const indexResponse = await env.ASSETS.fetch(indexRequest);
  if (indexResponse.status === 308 || indexResponse.status === 301 || indexResponse.status === 302) {
    const location = indexResponse.headers.get("Location");
    if (location === "/" || location === url.origin + "/") {
      const rootResponse = await env.ASSETS.fetch(new Request(new URL("/", url), request));
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

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  if (shouldServeAsStaticAsset(pathname)) {
    const staticResponse = await context.env.ASSETS.fetch(context.request);
    if (staticResponse.status !== 404) {
      return staticResponse;
    }
  }

  if (!isSpaRoute(pathname)) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (pathname === "/") {
    const root = await context.next();
    if (root.ok) {
      return root;
    }
    const index = await fetchIndexHtml(context.env, url, context.request);
    return index ?? root;
  }

  const index = await fetchIndexHtml(context.env, url, context.request);
  if (index) {
    return index;
  }

  const fallback = await context.next();
  if (fallback.ok) {
    return fallback;
  }

  return new Response("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
